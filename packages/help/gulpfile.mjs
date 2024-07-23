import process from 'node:process';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import pug from 'gulp-pug';
import gulpSass from 'gulp-sass';
import webpackStream from 'webpack-stream';
import GulpMemoryFs from 'gulp-memory-fs';
import * as sass from 'sass';
import named from 'vinyl-named';
import ForkTsCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const Sass = gulpSass(sass);

const isDev = process.env.NODE_ENV === 'development';

const mfs = new GulpMemoryFs({
  dir: 'dist',
  reload: true
});

function createWebpackConfig() {
  const webpackConfig = {
    mode: isDev ? 'development' : 'production',
    output: {
      globalObject: 'globalThis',
      filename: 'script/[name].js'
    },
    target: ['web', 'es5'],
    module: {
      rules: [
        {
          test: /^.*\.(m|c)?tsx?$/i,
          use: 'ts-loader'
        }
      ]
    },
    plugins: [
      new ForkTsCheckerPlugin({
        typescript: {
          mode: 'write-tsbuildinfo'
        },
        async: false
      })
    ],
    performance: { hints: false },
    experiments: {
      topLevelAwait: true
    }
  };

  if (!isDev) {
    const terserOptions = {
      ecma: 6,
      safari10: true
    };

    webpackConfig.optimization = {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions
        })
      ]
    };
  }

  return webpackConfig;
}

/* html */
function pugTask() {
  const src = [
    'src/**/*.pug',
    '!src/**/_*.pug'
  ];

  if (isDev) {
    return gulp.src(src)
      .pipe(mfs.changed())
      .pipe(plumber())
      .pipe(pug({ pretty: true }))
      .pipe(mfs.dest('dist'));
  } else {
    return gulp.src(src)
      .pipe(pug())
      .pipe(gulp.dest('dist'));
  }
}

/* css */
function sassTask() {
  const src = ['src/**/*.{sass,scss}'];

  if (isDev) {
    return gulp.src(src)
      .pipe(mfs.changed())
      .pipe(plumber())
      .pipe(Sass({
        style: 'expanded'
      }).on('error', Sass.logError))
      .pipe(mfs.dest('dist'));
  } else {
    return gulp.src(src)
      .pipe(Sass({
        style: 'compressed'
      }).on('error', Sass.logError))
      .pipe(gulp.dest('dist'));
  }
}

/* javascript */
/*
function webpackTask() {
  const src = [];

  if (isDev) {
    return gulp.src(src)
      .pipe(named())
      .pipe(mfs.changed())
      .pipe(plumber())
      .pipe(webpackStream(createWebpackConfig()))
      .pipe(mfs.dest('dist'));
  } else {
    return gulp.src(src)
      .pipe(named())
      .pipe(webpackStream(createWebpackConfig()))
      .pipe(gulp.dest('dist'));
  }
}
*/

/* 图片 */
function imageTask() {
  const src = ['src/**/*.{png,jpg,jpeg,gif,svg,webp,avif}'];

  if (isDev) {
    return gulp.src(src)
      .pipe(mfs.changed())
      .pipe(mfs.dest('dist'));
  } else {
    return gulp.src(src)
      .pipe(gulp.dest('dist'));
  }
}

function watchProject() {
  gulp.watch('src/**/*.pug', pugTask);
  gulp.watch('src/**/*.{sass,scss}', sassTask);
  // gulp.watch('src/**/*.{ts,tsx,mts,cts}', webpackTask);
  gulp.watch('src/**/*.{png,jpg,jpeg,gif,svg,webp,avif}', imageTask);
}

async function server() {
  await mfs.createServer();
}

function devInit() {
  return gulp.series(
    gulp.parallel(pugTask, sassTask, /* webpackTask, */ imageTask),
    gulp.parallel(watchProject, server)
  );
}

function proInit() {
  return gulp.parallel(pugTask, sassTask, /* webpackTask, */ imageTask);
}

export default isDev ? devInit() : proInit();