const gulp = require('gulp');
const terser = require('gulp-terser');
const typescript = require('gulp-typescript');
const baseTypescriptConfig = require('../../tsconfig.json');
const tsConfig = require('./tsconfig.json');

function build() {
  const result = gulp.src('src/**/*.{ts,tsx}')
    .pipe(typescript({
      ...baseTypescriptConfig.compilerOptions,
      ...tsConfig.compilerOptions
    }));

  return result.js
    .pipe(terser({ ecma: 2016 }))
    .pipe(gulp.dest('lib'));
}

exports.default = build;