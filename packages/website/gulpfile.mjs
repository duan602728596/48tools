import process from 'node:process';
import path from 'node:path';
import gulp from 'gulp';
import terser from 'gulp-terser';
import typescript from 'gulp-typescript';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import replace from 'gulp-replace';
import _ from 'lodash';
import { requireJson, metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);
const baseTypescriptConfig = await requireJson(path.join(__dirname, '../../tsconfig.json'));
const tsConfig = await requireJson(path.join(__dirname, './tsconfig.api.json'));

const isDevelopment = process.env.NODE_ENV === 'development';

/* 编译api */
function devApiTsProject() {
  const result = gulp.src('src-api/**/*.ts')
    .pipe(changed('dist/api'))
    .pipe(plumber())
    .pipe(typescript({
      ...baseTypescriptConfig.compilerOptions,
      ...tsConfig.compilerOptions
    }));

  return result.js.pipe(gulp.dest('dist/api'));
}

function apiTsProject() {
  const result = gulp.src('src-api/**/*.ts')
    .pipe(typescript({
      ...baseTypescriptConfig.compilerOptions,
      ...tsConfig.compilerOptions
    }));

  return result.js
    .pipe(terser({
      ecma: 2020,
      module: true
    }))
    .pipe(gulp.dest('dist/api'));
}

/* 拷贝package.json */
function packageJsonProject() {
  return gulp.src('package.json')
    .pipe(replace(/(.*\n?)*/, function(ms) {
      return JSON.stringify(_.omit(JSON.parse(ms), ['devDependencies', 'optionalDependencies']));
    }))
    .pipe(gulp.dest('dist'));
}

function watch() {
  gulp.watch('src-api/**/*.ts', devApiTsProject);
  gulp.watch('package.json', packageJsonProject);
}

export default isDevelopment
  ? gulp.series(gulp.parallel(devApiTsProject, packageJsonProject), watch)
  : apiTsProject;