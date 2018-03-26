/**
 * ButtonUI 组件带默认UI实现文件
 *
 * @version  1.0
 * @author   hzshaoyy <hzshaoyy@corp.netease.com>
 * @module   pool/component-button/src/button/ui
 */
NEJ.define( [
    './component.js',
    'text!./web/component.html',
    'text!./web/component.css'
],function(
    Button,
    html,
    css
){
    /**
     * Button UI组件
     *
     * @class   module:pool/component-button/src/button/ui.ButtonUI
     * @extends module:pool/component-button/src/button.Button
     *
     * @param {Object} options
     * @param {Object} options.data 与视图关联的数据模型
     */
    return Button.$extends({
        name     : 'ux-button',
        css      : css,
        template : html
    });
});




NEJ.define(['a', 'b', 'c'], function() {
    console.log('hello');
})

NEJ.define([], function() {
    console.log('hello');
})

NEJ.define(['a', 'b', 'c'], function(a, b, c, d) {
    console.log('hello');
})

NEJ.define(function() {
    console.log('hello');
})

NEJ.define(function(a,b,c,d) {
    console.log('hello');
})