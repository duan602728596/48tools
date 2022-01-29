export default {
  '/proxy/api': {
    target: 'http://127.0.0.1:5054/',
    changeOrigin: true,
    pathRewrite: { '^/proxy': '' }
  }
};