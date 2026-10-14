var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Copy third party libraries from /node_modules into /vendor.
// Gulp 5 decodes files as text unless told otherwise, which corrupts fonts.
function copy(globs, dest) {
  return function() {
    return gulp.src(globs, { encoding: false }).pipe(gulp.dest(dest));
  };
}

var vendor = gulp.parallel(
  // Bootstrap
  copy([
    './node_modules/bootstrap/dist/**/*',
    '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
    '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
  ], './vendor/bootstrap'),
  // Font Awesome
  copy([
    './node_modules/font-awesome/**/*',
    '!./node_modules/font-awesome/{less,less/*}',
    '!./node_modules/font-awesome/{scss,scss/*}',
    '!./node_modules/font-awesome/.*',
    '!./node_modules/font-awesome/*.{txt,json,md}'
  ], './vendor/font-awesome'),
  // jQuery
  copy([
    './node_modules/jquery/dist/*',
    '!./node_modules/jquery/dist/core.js'
  ], './vendor/jquery'),
  // Vide.js
  copy(['./node_modules/vide/dist/*'], './vendor/vide')
);

// Compile SCSS
function cssCompile() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./css'));
}

// Minify CSS
function cssMinify() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
}

var css = gulp.series(cssCompile, cssMinify);

// Minify JavaScript
function jsMinify() {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
}

// Configure the browserSync task
function serve(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  done();
}

function watch() {
  gulp.watch('./css/*.css').on('change', browserSync.reload);
  gulp.watch('./scss/*.scss', css);
  gulp.watch(['./js/*.js', '!./js/*.min.js'], jsMinify);
  gulp.watch('./*.html').on('change', browserSync.reload);
}

exports.vendor = vendor;
exports.css = css;
exports.js = jsMinify;
exports.default = gulp.parallel(css, jsMinify, vendor);
exports.dev = gulp.series(serve, watch);
