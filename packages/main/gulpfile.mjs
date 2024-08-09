import gulp from 'gulp';
import gulpTerser from 'gulp-terser';
import gulpChangeFileContent from 'gulp-change-file-content';

/* 代码压缩 */
function minifyCode() {
  return gulp.src([
    '.lib.mid/**/*.{js,cjs,mjs}',
    '!.lib.mid/**/channelEnum.{js,cjs,mjs}',
    '!.lib.mid/_sourcemap.{js,cjs,mjs}'
  ])
    .pipe(gulpChangeFileContent((content) => {
      return content.replace(/(\/\*.*@#START_DEV_1.*\*\/).*(\/\*.*@#END_DEV_1.*\*\/)/, '');
    }))
    .pipe(gulpTerser({
      ecma: 2020,
      module: true
    }))
    .pipe(gulp.dest('lib'));
}

export default minifyCode;