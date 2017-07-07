'use strict';

var gulp          = require('gulp');
var del           = require('del');
var plumber       = require('gulp-plumber');
var sass          = require('gulp-sass');
var pug           = require('gulp-pug');
var autoprefixer  = require('gulp-autoprefixer');
var sourcemaps    = require('gulp-sourcemaps');
var spritesmith   = require('gulp.spritesmith');
var imagemin      = require('gulp-imagemin');
var fileinclude   = require('gulp-file-include');
var babel         = require('gulp-babel');
var prettify      = require('gulp-prettify');



gulp.task('img',function(){
  var images = gulp.src('sourse/images/img/**')
      .pipe(imagemin())
      .pipe(gulp.dest('public/images'));
  return images;
});

gulp.task('css',function(){
  var sprite = gulp.src('sourse/images/*/*.png')
      .pipe(spritesmith({
        imgName: 'icon.png',
        cssName: '_icon.scss',
        imgPath: '../images/icon.png',
        padding: 10,
        cssTemplate: 'sprite.setting',
        cssFormat: 'scss',
        algorithm: 'top-down'
      }));
  var imgStream = sprite.img
      .pipe(gulp.dest('public/images'));
  var cssStream = sprite.css
      .pipe(gulp.dest('sourse/scss'));
  var scss = gulp.src('sourse/scss/*.scss')
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe( sass({ 
          outputStyle:'compact',
          includePaths: ['node_modules/susy/sass','node_modules/breakpoint-sass/stylesheets']
        }).on('error',sass.logError))
      .pipe(autoprefixer())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('public/css'));
  return sprite, imgStream, cssStream, scss;
});

gulp.task('js',function(){
  gulp.src('sourse/js/*.js')
      .pipe(plumber())
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(gulp.dest('public/js'));
});

gulp.task('html', function() {
  var build = gulp.src(['sourse/*.pug','sourse/**/*.pug','sourse/*.html','sourse/**/*.html'])
      .pipe(plumber())
      .pipe(fileinclude({
        prefix: '@@'
      }))
      .pipe(pug({ 
        pretty:'\t' 
      }))
      .pipe(prettify({indent_size: 2}))
      .pipe(gulp.dest('public'));
  return build;
});

gulp.task('clean',function(){
  del(['public/include/**','public/scss/**']);
});

gulp.task('watch',function(){
  gulp.watch('sourse/images/img/**',['img']);
  gulp.watch('sourse/scss/*.scss',['css']);
  gulp.watch('sourse/js/*.js',['js']);
  gulp.watch(['sourse/*.pug','sourse/**/*.pug','sourse/*.html','sourse/**/*.html'],['html']);
  gulp.watch('public/**',['clean']);
});
