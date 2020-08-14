const path = require('path');

const webpack = require('webpack');
// 定义压缩文件类型
const productionGzipExtensions = ['js', 'css'];

const resolve = (dir) => {
  return path.join(__dirname, dir);
};
const PUBLIC_URL = process.env.NODE_ENV === 'production' ? './' : './';

module.exports = {
  publicPath: PUBLIC_URL,
  lintOnSave: false,
  chainWebpack: (config) => {
    config.resolve.symlinks(true);
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');

    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('@component', resolve('src/components')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('@pages', resolve('src/pages')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('@assets', resolve('src/assets')); // key,value自行定义，比如.set('@@', resolve('src/components'))
  },
  configureWebpack: () => {
    if (process.env.NODE_ENV === 'production') {
      return {
        performance: {
          hints: 'warning',
          //入口起点的最大体积 整数类型（以字节为单位）
          maxEntrypointSize: 50000000,
          //生成文件的最大体积 整数类型（以字节为单位 300k）
          maxAssetSize: 30000000,
          //只给出 js 文件的性能提示
          assetFilter: function(assetFilename) {
            return assetFilename.endsWith('.js');
          },
        },
      };
    }
  },
  productionSourceMap: false,
};
