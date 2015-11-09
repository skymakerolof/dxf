var gulp = require('gulp');
var path = require('path');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var jscsStylish = require('gulp-jscs-stylish');
var mocha = require('gulp-mocha');

var srcFiles = path.join('lib', '**', '*.js');
var unitTestFiles = path.join('test', 'unit', '**', '*.test.js');
var functionalTestFiles = path.join('test', 'functional', '**', '*.test.js');

// ----- Individual Tasks -----

gulp.task('clearconsole', function() {
  process.stdout.write('\x1Bc');
});

gulp.task('jshint', function() {
  return gulp.src([srcFiles, unitTestFiles])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function() {
  return gulp.src([srcFiles, unitTestFiles])
    .pipe(jscs())
    .pipe(jscsStylish());
});

gulp.task('unit', function() {
  return gulp.src(unitTestFiles)
    .pipe(mocha({}));
});

gulp.task('functional', function() {
  return gulp.src(functionalTestFiles)
    .pipe(mocha({}));
});

// ----- Aggregate Tasks -----

gulp.task('test', ['jshint', 'jscs', 'unit', 'functional']);

gulp.task('default', ['test']);

gulp.task('watch', function() {
  gulp.watch(srcFiles, ['clearconsole', 'jshint', 'jscs', 'unit', 'functional']);
  gulp.watch(unitTestFiles, ['clearconsole', 'jshint', 'jscs', 'unit']);
  gulp.watch(functionalTestFiles, ['clearconsole', 'jshint', 'jscs', 'functional']);
});
