var path = require('path');
var glob = require('glob');

// 导入插件
const miniCssExtractPlugin  = require('mini-css-extract-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var config = {
    entry: {
        index: './src/index.js', // 入口，表示从index.js开始工作
    },
    output: {
        path: path.join(__dirname,'./dist'), // 存放打包后文件的输出目录，必填
        publicPath: '/dist/', // 指定资源文件引用的目录
        filename: 'js/[name]-build.js', // 指定输出文件名称
        assetModuleFilename: "assets/[hash:8].[name][ext]", // 指定静态文件输出路径和文件名称
    },
    mode: "development", // 指定mode development开发环境，production生产环境
    devtool: 'inline-source-map', 
    devServer: {// devServer配置：https://webpack.docschina.org/configuration/dev-server/
      static: {// webpack-dev-server V4的配置，V3版本有些许不同，具体可以查看迁移指南 https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md
        directory: path.resolve(__dirname, "dist"),//告诉服务器从哪里提供内容。只有在你希望提供静态文件时才需要这样做
        publicPath: "/",//告诉服务器在哪个 URL 上提供内容，简单来说就是访问地址的URL后缀
        serveIndex: true,// 告诉开发服务器启用后使用 serveIndex 中间件。serveIndex 中间件会在查看没有 index.html 文件的目录时生成目录列表。
        watch: true // 告知 dev-server，serve(服务) devServer.contentBase 选项下的文件。开启此选项后，在文件修改之后，会触发一次完整的页面重载。
      },
      host: '127.0.0.1',  //指定使用一个 host。默认是 localhost。如果你希望服务器外部可访问 可以指定为0.0.0.0
      port: 8888, // 指定要监听请求的端口号 webpack serve  --host 127.0.0.1 --port 8888
      open: { // 告诉 dev-server 在服务器已经启动后打开浏览器。设置其为 true 以打开你的默认浏览器。
        target: ["/"], // 在浏览器中打开指定页面，可以指定多个
        app: {
          name: 'chrome' // 提供要使用的浏览器名称(这里的名称以你在系统设置的具体名称为准)，而不是默认名称 
        }
      },
    },
    plugins: [
      new htmlWebpackPlugin({
        template: './src/index.html',//使用模板index.html
        filename: 'index.html',//打包生成的文件名叫index.html
        chunks:['index']//index.html里引用打包生成的index.js
      }),
      new miniCssExtractPlugin({
          // 指定每个输出CSS文件的名称
          filename: path.join('css','[name].css') 
      }),
      // 每次打包前清除以前打包生成的文件
      new CleanWebpackPlugin({
        dry: true,
      })
    ] ,
    module:{
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [{
                  // inject CSS to page
                  // loader: 'style-loader'
                  // 使用mini-css-extract-plugin插件单独提取CSS并插入到page,https://webpack.docschina.org/loaders/sass-loader/#extracts-css-into-separate-files
                  loader: miniCssExtractPlugin.loader
                }, {
                  // translates CSS into CommonJS modules
                  loader: 'css-loader'
                }, {
                  // Run postcss actions
                  loader: 'postcss-loader',
                  options: {
                    // `postcssOptions` is needed for postcss 8.x;
                    // if you use postcss 7.x skip the key
                    postcssOptions: {
                      // postcss plugins, can be exported to postcss.config.js
                      plugins: function () {
                        return [
                          require('autoprefixer')
                        ];
                      }
                    }
                  }
                }, {
                  // compiles Sass to CSS
                  loader: 'sass-loader'
                }]
              },
              // webpack5使用assets-module处理静态资源
              {
                test: /\.(png|jpg|svg|gif)$/,
                type: 'asset',
                //解析
                parser: {
                  //转base64的条件
                  dataUrlCondition: {
                    maxSize: 25 * 1024, // 25kb
                  }
                },
                generator: {
                    // [ext]前面自带"."
                    //  filename: 'assets/[hash:8].[name][ext]', // 也可以在output:中使用assetModuleFilename配置
                }
              },
              {
                test:/\.html$/,
                //处理html文件的img图片 // 图片路径可以在output:中使用assetModuleFilename配置
                loader:'html-loader', 
                options: {
                  sources: {
                    list: [
                      // All default supported tags and attributes
                      {
                        tag: "img",
                        attribute: "src",
                        type: "src",
                      },
                    ],
                  },
              }
            },
        ]
    }  
};

// 配置参考：https://www.cnblogs.com/shiyunfront/articles/8782558.html
// 获取指定路径下的入口文件
function getEntries(globPath) {
  var files = glob.sync(globPath),
    entries = {};

  files.forEach(function(filepath) {
      // 取倒数第二层(pages下面的文件夹)做包名
      var split = filepath.split('/');
      var name = split[split.length - 2];

      entries[name] = './' + filepath;
  });

  return entries;
}
     
var entries = getEntries('src/pages/**/index.js');

Object.keys(entries).forEach(function(name) {
 // 每个页面生成一个entry，如果需要HotUpdate，在这里修改entry
 config.entry[name] = entries[name];
 
 // 每个页面生成一个html
 var plugin = new htmlWebpackPlugin({
     // 生成出来的html文件名
     filename: path.join('pages',name,'index.html'),
     // 每个html的模版
     template: path.join('src','pages',name,'index.html'),
     // 自动将引用插入html
     inject: true,
     // 每个html引用的js模块，也可以在这里加上vendor等公用模块
     chunks: [name]
 });
 config.plugins.push(plugin);
})

module.exports = config;