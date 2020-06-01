const { series, parallel, src, dest, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const del = require('del');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const base64 = require('gulp-base64-inline');
const fileinclude = require('gulp-file-include');
const babel = require('gulp-babel');
const prettier = require('gulp-prettier');

// create sprite
const sourcemaps = require('gulp-sourcemaps');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');

// create icon font
const iconfont = require('gulp-iconfont');
const consolidate = require('gulp-consolidate');

function img() {
  return src('src/images/img/**/!(_)*.png')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest('dist/images'));
}

function css() {
  return src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compact',
        includePaths: [''],
      }).on('error', sass.logError)
    )
    .pipe(base64('../images/img'))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'));
}

function js() {
  return src('src/js/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'));
}

function html() {
  return src('src/**/!(_)*.html')
    .pipe(plumber())
    .pipe(
      fileinclude({
        prefix: '@@',
      })
    )
    .pipe(dest('./dist'));
}

function clean() {
  return del(['dist/**', '!dist/fonts', '!dist/fonts/**']).then(() => {
    console.log('init...');
  });
}

function watchList() {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
    port: 5000,
  });

  watch(['src/images/img/**'], series(img));
  watch(['src/scss/**/*.scss'], series(css));
  watch(['src/js/**/*.js'], series(js));
  watch(['src/**/*.html'], series(html));
  watch(['src/**']).on('unlink', series(clean, parallel(img, sprite, css, js, html)));
  watch(['dist/**']).on('change', reload);
}

exports.watch = watchList;


function font() {
  const fontName = 'fonts';
  return src('src/svg/*.svg')
    .pipe(
      iconfont({
        fontName: fontName,
        formats: ['ttf', 'eot', 'woff', 'woff2'],
        normalize: true,
      })
    )
    .on('glyphs', function (glyphs, option) {
      src('src/font/*.scss')
        .pipe(
          consolidate('lodash', {
            glyphs: glyphs,
            commonName: 'font',
            fontName: fontName,
            fontPath: '../../fonts/',
            className: 'fic',
          })
        )
        .pipe(dest('src/scss'));
    })
    .pipe(dest('dist/fonts'));
}
exports.font = font;

function sprite() {
  let spriteData = src('src/images/sprite/**/*.png').pipe(
    spritesmith({
      imgName: '_sprite.png',
      cssName: '_sprite.scss',
      imgPath: '_sprite.png',
      padding: 10,
      cssTemplate: (data) => {
        let spriteArr = [];
        data.sprites.forEach(function (sprite) {
          spriteArr.push(`
            .${sprite.name} {
              display: block;
              width: ${sprite.width / 16}rem;
              height: ${sprite.height / 16}rem;
              background-size: ${
                (data.spritesheet.width / sprite.width) * 100
              }%  ${(data.spritesheet.height / sprite.height) * 100}%;
              background-position: 0 ${((-1 * sprite.offset_y) / (data.spritesheet.height - sprite.height)) * 100}%;
            }
          `);
        });
        spriteArr.push(`
          .${data.options.spriteName}{ background-image: inline('${data.spritesheet.image}'); }
        `);
        return spriteArr.join('');
      },
      cssFormat: 'scss',
      algorithm: 'top-down',
      cssOpts: {
        spriteName: 'icon',
      },
    })
  );
  let cssStream = spriteData.css.pipe(prettier()).pipe(dest('src/scss'));
  let imgStream = spriteData.img.pipe(dest('src/images/img'));

  return merge(imgStream, cssStream);
}
exports.sprite = sprite;