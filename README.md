# babel-plugin-transform-nej-module

使用webpack打包nej。通过本插件，可以将nej的依赖管理系统转换为标准AMD格式，使得webpack能够对它进行打包。

## 示例
原NEJ模块文件
```javascript
// NEJ模块
NEJ.define( [
    '../component.js',
    'text!./component.html',
    'text!./component.css'
],function(
    Component,
    html,
    css,
    pro,
    o, f, r
) {
    return uxModal;
});
```
转换后文件：

```javascript
// CommonJS模块
(function nejModule() {
    var Component = require('../component');
    var html = require('./component.html');
    var css = require('./component.css');

    var css = "";
    
    var pro = exports;
    
    var o = {};
    var f = function () {};
    var r = [];
    
    module.exports = uxModal;
    return;
}).call(window);
```

## 使用方法
1. 安装：`npm install --save-dev babel-plugin-transform-nej-module babel-plugin-transform-remove-strict-mode`;
2. 在babel-loader中使用本插件，配合`babel-plugin-transform-remove-strict-mode`使用
```javascript
{
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: [],
            plugins: ["transform-remove-strict-mode",'babel-plugin-transform-nej-module']
        }
    }
},
```
3. 在`webpack.config.js`中增加路径配置，根据NEJ所在位置自行调整
```
{
    resolve: {
        alias: {
            'base': resolve('lib/nej/src/base'),
            'lib': resolve('lib/nej/src'),
            'ui': resolve('lib/nej/src/ui'),
            'util': resolve('lib/nej/src/util')
        }
    }
}
```

## 插件运行剖析

流程图：
![](http://owzglh4qp.bkt.clouddn.com/18-4-17/48129591.jpg)

1. **从文件的根开始**：为什么要从根开始？在babel插件的不同的visitor中，难免会需要共享变量。这些共享变量的初始化，应该在每个文件第一次进入时进行。因此选择从根开始处理文件，以便在文件开始运行前做一些初始化处理。(Babel插件处理文件的顺序是并行的还是串行的，这一点尚有待验证。如果是串行的，在pre阶段进行初始化更好。)

2. **取第一层节点**：JS文件被Babylon parse成一棵AST树，取该树的第一层节点开始后续处理。为什么取第一层？在以NEJ为基础的前端工程中，所有的业务代码都包含在NEJ.define/define语句中，形成模块。 如果NEJ模块被包含在其他代码块中，那它不一定能被执行到，则该模块是无效的。 即使一定能执行到，在NEJ打包时，也不会将模块外部的代码打包。
如果从任意一条语句开始，可能会遇到其他文件中的define函数被识别为nej模块情况。
因此，我们只考虑一个文件就是一个nej模块的情况

3. **判断NEJ模块**：nej.define() 或者 define()函数被识别为NEJ模块

4. **获取依赖列表和回调函数**：处理了无依赖列表、依赖列表为空、回调函数为变量的情况。

5. **进一步寻找回调函数**（当回调函数为变量的时候）：访问模块内代码的所有赋值语句，找到对回调函数变量赋值的语句。

6. **将回调函数命名为nejModule**：这一步很重要。用来定位回调函数的return和输出结果集空间的变动，并进行跟踪修改。

7. **处理return**：回调函数对应的return xxx为module.exports = xxx; return;

8. **处理依赖**：

- 初始化注入参数；
- 标准化依赖路径；
- 初始化css文件为空字符串，以兼容NEJ对css的处理，尽管这些处理在不使用define函数的时候是无效的。

9. **处理输出结果集空间**（设为pro）：将所有使用到pro的代码替换为exports，(不直接module.exports = pro，因为需要处理循环依赖)

9. **保证模块内this指向window**：使用自执行函数将全部语句包装起来。

## 未处理情况
1. 尚存在两种罕见的异常未做处理：
text!方式引入的css文件为空字符串，实际应该是css文件的内容;
输出结果集空间被直接修改为其它对象;
2. NEJ对于不同平台的适配处理：
{platform}/element.js被转化为./platform/element.js，实际应当同时引入./platform/element.patch.js

**如果你发现了任何其它异常情况，请一定要提出issue或直接联系我们，我们将会在最快时间内解决**
