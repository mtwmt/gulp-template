'use strict';

// Load plugins
const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const spritesmith = require('gulp.spritesmith');
// 將 spritesmith 的 img,scss 分開輸出 需加裝 merge
const merge = require('merge-stream');
const imagemin = require('gulp-imagemin');
const base64 = require('gulp-base64-inline');
const fileinclude = require('gulp-file-include');
// 要加裝 babel-preset-env
const babel = require('gulp-babel');
const prettify = require('gulp-prettify');

let img = function() {
  return gulp
    .src('sourse/images/img/**')
    .pipe(imagemin())
    .pipe(gulp.dest('public/images'));
};

let sprite = function() {
  var spriteData = gulp
    .src('sourse/images/*/*.png')
    .pipe(
      spritesmith({
        imgName: 'icon.png',
        cssName: '_icon.scss',
        imgPath: '../images/icon.png',
        padding: 10,
        cssTemplate: 'sprite.handlebars',
        cssFormat: 'scss',
        algorithm: 'top-down',
        cssOpts: {
          spriteName: 'icon',
        },
      })
    );

  var imgStream = spriteData.img.pipe(gulp.dest('public/images'));
  var cssStream = spriteData.css.pipe(gulp.dest('sourse/scss'));

  return merge(imgStream, cssStream);
};

let css = function() {
  return gulp
    .src('sourse/scss/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compact',
        includePaths: [''],
      }).on('error', sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css'));
};

let js = function() {
  return gulp
    .src('sourse/js/*.js')
    .pipe(plumber())
    .pipe(babel({ presets: ['env'] }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulp.dest('public/js'));
};

let html = function() {
  return gulp
    .src(['sourse/*.html', 'sourse/**/*.html'])
    .pipe(plumber())
    .pipe(prettify({ indent_size: 2 }))
    .pipe(gulp.dest('public'));
};

let clean = function() {
  return del(['public/include/**', 'public/scss/**']);
};

let watchfile = function() {
  gulp.watch('sourse/images/img/**', img);
  gulp.watch('sourse/images/icon/**', sprite);
  gulp.watch('sourse/scss/*.scss', css);
  gulp.watch('sourse/js/*.js', js);
  gulp.watch(['sourse/*.html', 'sourse/**/*.html'], html);
};

const watch = gulp.series(clean, watchfile);

exports.sprite = sprite;

exports.default = watch;
