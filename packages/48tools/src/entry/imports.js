/* 按需加载 */

if (process.env.NODE_ENV === 'development') {
  module.exports = {
    dll: require('../../.sweet/dll/dll')
  };
} else {
  module.exports = {};
}