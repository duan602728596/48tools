const process = require('process');
const gulp = require('gulp');
const changed = require('gulp-changed');
const plumber = require('gulp-plumber');
const coffee = require('gulp-coffee2');
const rollup = require('rollup');
const errorHandler = require('./errorHandler.js');

const env = process.env.NODE_ENV;
let dirname = null;

function coffeeProject(){
  return gulp.src(dirname + '/src/**/*.coffee')
    .pipe(changed(dirname + '/lib', {
      extension: '.js'
    }))
    .pipe(plumber({
      errorHandler: errorHandler
    }))
    .pipe(coffee())
    .pipe(gulp.dest(dirname + '/lib'));
}

function build(){
  // rollup
  const entry = dirname + '/lib/index.js';
  const dest = dirname + '/build/bilibili.js';

  return rollup.rollup({
    input: entry
  }).then((bundle)=>{
    bundle.write({
      format: 'umd',
      name: 'bilibili',
      file: dest
    });
  });
}

function watch(){
  gulp.watch(dirname + '/src/**/*.coffee', gulp.series(coffeeProject, build));
}

module.exports = function(dir){
  dirname = dir;

  const gc = [coffeeProject, build];
  if(env === 'development') gc.push(watch);

  gulp.task('default', gulp.series(...gc));
};
