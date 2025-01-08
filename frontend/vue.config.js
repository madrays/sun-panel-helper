module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        ws: false,
        changeOrigin: true
      }
    }
  }
} 