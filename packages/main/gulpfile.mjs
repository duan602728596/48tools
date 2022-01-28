import process from 'node:process';
import path from 'node:path';
import gulp from 'gulp';
import terser from 'gulp-terser';
import typescript from 'gulp-typescript';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import { requireJson, metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);
const baseTypescriptConfig = await requireJson(path.join(__dirname, '../../tsconfig.api.json'));
const tsConfig = await requireJson(path.join(__dirname, './tsconfig.api.json'));

const isDevelopment = process.env.NODE_ENV === 'development';
const isWatch = process.env.WATCH;

function devTsProject() {
  const result = gulp.src('src/**/*.{ts,tsx}')
    .pipe(changed('lib'))
    .pipe(plumber())
    .pipe(typescript({
      ...baseTypescriptConfig.compilerOptions,
      ...tsConfig.compilerOptions
    }));

  return result.js.pipe(gulp.dest('lib'));
}

function watch() {
  gulp.watch('src/**/*.{ts,tsx}', devTsProject);
}

function tsProject() {
  const result = gulp.src('src/**/*.{ts,tsx}')
    .pipe(typescript({
      ...baseTypescriptConfig.compilerOptions,
      ...tsConfig.compilerOptions
    }));

  return result.js
    .pipe(terser({
      ecma: 2020,
      module: true
    }))
    .pipe(gulp.dest('lib'));
}

export default isDevelopment
  ? (isWatch ? gulp.series(devTsProject, watch) : devTsProject)
  : tsProject;