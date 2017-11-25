/* 错误处理函数 */
const notify = require('gulp-notify');

const errorHandler = (error)=>{
  const args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    messages: '<%= error.message %>'
  }).apply(this, args);
};

module.exports = errorHandler;