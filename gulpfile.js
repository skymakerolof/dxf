const gulp = require('gulp');
const path = require('path');
const jshint = require('gulp-jshint');
const jscs = require('gulp-jscs');
const jscsStylish = require('gulp-jscs-stylish');
const mocha = require('gulp-mocha');
const del = require('del');

const srcFiles = path.join('lib', '**', '*.js');
const unitTestFiles = path.join('test', 'unit', '**', '*.test.js');
const functionalTestFiles = path.join('test', 'functional', '*.test.js');

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

gulp.task('clean:output', function () {
  return del([
    'test/functional/output/*',
  ]);
});


gulp.task('functional', ['clean:output'], function() {
  return gulp.src(functionalTestFiles)
    .pipe(mocha({}));
});

// ----- Aggregate Tasks -----

gulp.task('test', ['jshint', 'jscs', 'unit', 'functional']);

gulp.task('default', ['test']);

gulp.task('watch', function() {
  // gulp.watch(srcFiles, ['clearconsole', 'jshint', 'jscs', 'unit', 'functional']);
  gulp.watch(srcFiles, ['clearconsole', 'jshint', 'jscs', 'unit']);
  gulp.watch(unitTestFiles, ['clearconsole', 'jshint', 'jscs', 'unit']);
  gulp.watch(functionalTestFiles, ['clearconsole', 'jshint', 'jscs', 'functional']);
});
