# babel-plugin-transform-nej-module

使用webpack打包nej。通过本插件，可以将nej的依赖管理系统转换为标准AMD格式，使得webpack能够对它进行打包。

## 使用方法
1. 安装：`npm install --save-dev babel-plugin-transform-nej-module`;
2. 在babel-loader中使用本插件
```javascript
{
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: [],
            plugins: ['babel-plugin-transform-nej-module']
        }
    }
},
```
3. 在`webpack.config.js`中增加路径配置，根据nej所在位置、代码使用的别名进行调整;
```
{
    resolve: {
        alias: {
            'base': path.resolve(__dirname, 'lib/nej/src/base'),
            'platform': path.resolve(__dirname, 'lib/nej/src/base/platform')
        }
    }
}
```

## 使用示例

webpack配置示例如下：
```javascript
const path = require('path');
const resolve =path.resolve;

module.exports = {
    resolve: {
        alias: {
            'base': resolve('lib/nej/src/base'),
            'lib': resolve('lib/nej/src'),
            'ui': resolve('lib/nej/src/ui'),
            'util': resolve('lib/nej/src/util')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-es2015'],
                        plugins: ["transform-remove-strict-mode", 'babel-plugin-transform-nej-module']
                    }
                }
            },
            {
                test: /\.css$/,
                exclude: /(node_modules|bower_components)/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            }
        ]
    }
}
```

## 处理方法(待完成)