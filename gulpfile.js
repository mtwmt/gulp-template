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


var path = {
  src: 'sourse',
  dist: 'public',
  img: 'images'
}

gulp.task('img',function(){
  var images = gulp.src(''+ path.src +'/'+ path.img +'/img/**')
      .pipe(imagemin())
      .pipe(gulp.dest(''+ path.dist +'/'+ path.img +''));
  return images;
});

gulp.task('css',function(){
  var sprite = gulp.src(''+ path.src +'/'+ path.img +'/*/*.png')
      .pipe(spritesmith({
        imgName: 'icon.png',
        cssName: '_icon.scss',
        imgPath: '../'+ path.img +'/icon.png',
        padding: 10,
        cssTemplate: 'sprite.handlebars',
        cssFormat: 'scss',
        algorithm: 'top-down'
      }));
  var imgStream = sprite.img
      .pipe(gulp.dest(''+ path.dist +'/'+ path.img +''));
  var cssStream = sprite.css
      .pipe(gulp.dest(''+ path.src +'/scss'));

  var scss = gulp.src(''+ path.src +'/scss/*.scss')
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe( sass({ 
          outputStyle:'compact',
          includePaths: ['node_modules/susy/sass','node_modules/breakpoint-sass/stylesheets']
        }).on('error',sass.logError))
      .pipe(autoprefixer())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(''+ path.dist +'/css'));
  return sprite, imgStream, cssStream, scss;
});

gulp.task('js',function(){
  gulp.src(''+ path.src +'/js/*.js')
      .pipe(plumber())
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(gulp.dest(''+ path.dist +'/js'));
});

gulp.task('html', function() {
  var build = gulp.src([''+ path.src +'/*.pug',''+ path.src +'/**/*.pug',''+ path.src +'/*.html',''+ path.src +'/**/*.html'])
      .pipe(plumber())
      .pipe(fileinclude({
        prefix: '@@'
      }))
      .pipe(pug({ 
        pretty:'\t' 
      }))
      .pipe(prettify({indent_size: 2}))
      .pipe(gulp.dest(path.dist));
  return build;
});

gulp.task('clean',function(){
  del([''+ path.dist +'/include/**',''+ path.dist +'/scss/**']);
});

gulp.task('watch',function(){
  gulp.watch(''+ path.src +'/'+ path.img +'/img/**',['img']);
  gulp.watch(''+ path.src +'/scss/*.scss',['css']);
  gulp.watch(''+ path.src +'/js/*.js',['js']);
  gulp.watch([''+ path.src +'/*.pug',''+ path.src +'/**/*.pug',''+ path.src +'/*.html',''+ path.src +'/**/*.html'],['html']);
  gulp.watch('public/**',['clean']);
});

gulp.task('default', function() {
  gulp.watch(''+ path.src +'/'+ path.img +'/img/**',['img']);
  gulp.watch(''+ path.src +'/scss/*.scss',['css']);
  gulp.watch(''+ path.src +'/js/*.js',['js']);
  gulp.watch([''+ path.src +'/*.pug',''+ path.src +'/**/*.pug',''+ path.src +'/*.html',''+ path.src +'/**/*.html'],['html']);
  gulp.watch(''+ path.dist +'/**',['clean']);
});
