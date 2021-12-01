var path = require('path');

// 导入插件
var miniCssExtractPlugin  = require('mini-css-extract-plugin');
var htmlWebpackPlugin = require('html-webpack-plugin');

var config = {
    entry: {
        index: './src/index.js', // 入口，表示从index.js开始工作
        carousel: './src/pages/carousel/index.js',
    },
    output: {
        path: path.join(__dirname,'./dist'), // 存放打包后文件的输出目录，必填
        publicPath: '/dist/', // 指定资源文件引用的目录
        filename: 'js/[name]-build.js', // 指定输出文件名称
        assetModuleFilename: "assets/[hash:8].[name][ext]", // 指定静态文件输出路径和文件名称
    },
    mode: "development", // 指定mode development开发环境，production生产环境
    devtool: 'inline-source-map', 
    devServer: {
      contentBase: path.join(__dirname, "dist"), //告诉服务器从哪里提供内容。只有在你希望提供静态文件时才需要这样做
      contentBasePublicPath: "/", //告诉服务器在哪个 URL 上提供内容，简单来说就是访问地址的URL后缀
      serveIndex: true, // 告诉开发服务器启用后使用 serveIndex 中间件。serveIndex 中间件会在查看没有 index.html 文件的目录时生成目录列表。
      watchContentBase: true, // 告知 dev-server，serve(服务) devServer.contentBase 选项下的文件。开启此选项后，在文件修改之后，会触发一次完整的页面重载。
      host: '127.0.0.1',  //指定使用一个 host。默认是 localhost。如果你希望服务器外部可访问 可以指定为0.0.0.0
      port: 8888, // 指定要监听请求的端口号 webpack serve  --host 127.0.0.1 --port 8888
      open: 'chrome', //告诉 dev-server 在 server 启动后打开浏览器。默认禁用。 cli方式：webpack serve --open 'Google Chrome'
    },
    plugins: [
      new htmlWebpackPlugin({
        template: './src/index.html',//使用模板index.html
        filename: 'index.html',//打包生成的文件名叫index.html
        chunks:['index']//index.html里引用打包生成的index.js
      }),
      new htmlWebpackPlugin({
        template: './src/pages/carousel/index.html',
        filename: 'pages/carousel/index.html',
        chunks:['carousel']
      }),
      new miniCssExtractPlugin({
          // 指定每个输出CSS文件的名称
          filename: 'css-[name].css' 
      })
    ] ,
    module:{
        rules: [
            {
                test: /\.css$/,
                use: [miniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(scss)$/,
                use: [{
                  // inject CSS to page
                  loader: 'style-loader'
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

module.exports = config;