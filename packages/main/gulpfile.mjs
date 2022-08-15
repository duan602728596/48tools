import gulp from 'gulp';
import terser from 'gulp-terser';

/* 代码压缩 */
function minifyCode() {
  return gulp.src('.lib.mid/**/*.{js,cjs,mjs}')
    .pipe(terser({
      ecma: 2020,
      module: true
    }))
    .pipe(gulp.dest('lib'));
}

export default minifyCode;