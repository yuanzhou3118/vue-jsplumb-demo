const path = require('path');

const webpack = require('webpack');
// 定义压缩文件类型
const productionGzipExtensions = ['js', 'css'];

const resolve = (dir) => {
  return path.join(__dirname, dir);
};

// const PUBLIC_URL = process.env.NODE_ENV === "production" ? "/projectAnalysis" : "/";
const PUBLIC_URL = process.env.NODE_ENV === 'production' ? './' : './';

module.exports = {
  publicPath: PUBLIC_URL,
  lintOnSave: false,
  chainWebpack: (config) => {
    // const svgRule = config.module.rule("svg"); // 找到svg-loader
    // svgRule.uses.clear(); // 清除已有的loader, 如果不这样做会添加在此loader之后
    // svgRule.exclude.add(/node_modules/); // 正则匹配排除node_modules目录
    // svgRule // 添加svg新的loader处理
    //   .test(/\.svg$/)
    //   .use("svg-sprite-loader")
    //   .loader("svg-sprite-loader")
    //   .options({
    //     symbolId: "icon-[name]"
    //   });

    // 修改images loader 添加svg处理
    // const imagesRule = config.module.rule("images");
    // imagesRule.exclude.add(resolve("src/assets/Icons"));
    // config.module.rule("images").test(/\.(png|jpe?g|gif|svg)(\?.*)?$/);
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
  // css: {
  //   loaderOptions: {
  //     postcss: {
  //       plugins: [
  //         require('postcss-plugin-px2rem')({
  //           rootValue: 100, //换算基数， 默认100  ，这样的话把根标签的字体规定为1rem为50px,这样就可以从设计稿上量出多少个px直接在代码中写多上px了。
  //           // unitPrecision: 5, //允许REM单位增长到的十进制数字。
  //           //propWhiteList: [],  //默认值是一个空数组，这意味着禁用白名单并启用所有属性。
  //           // propBlackList: [], //黑名单
  //           exclude: false, //默认false，可以（reg）利用正则表达式排除某些文件夹的方法，例如/(node_module)/ 。如果想把前端UI框架内的px也转换成rem，请把此属性设为默认值
  //           // selectorBlackList: [], //要忽略并保留为px的选择器
  //           // ignoreIdentifier: false,  //（boolean/string）忽略单个属性的方法，启用ignoreidentifier后，replace将自动设置为true。
  //           // replace: true, // （布尔值）替换包含REM的规则，而不是添加回退。
  //           mediaQuery: false, //（布尔值）允许在媒体查询中转换px。
  //           minPixelValue: 0, //设置要替换的最小像素值(3px会被转rem)。 默认 0
  //         }),
  //       ],
  //     },
  //   },
  // },
  // 打包时不生成.map文件
  productionSourceMap: false,
};
