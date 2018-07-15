/* less-loader 配置 (for antd) */

// 换肤
// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
const modifyVars = {
  // -------- Colors -----------
  '@primary-color': '#f5222d',
  // Layout
  '@layout-body-background': '#fff',
  '@layout-header-background': '@primary-color'
};

module.exports = {
  loader: 'less-loader',
  options: {
    javascriptEnabled: true,
    modifyVars
  }
};