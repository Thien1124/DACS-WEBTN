const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5006',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyRes: function(proxyRes, req, res) {
        console.log('RAW Response:', proxyRes.statusCode);
      }
    })
  );
};