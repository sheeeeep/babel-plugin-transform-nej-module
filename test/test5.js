/**
 *  util文件
 *
 *  @version  1.0
 *  @author   hzshaoyy <hzshaoyy@corp.netease.com>
 *  @module   pool/component-base/src/util
 */

NEJ.define(function(exports){
    /**
     * DOM 辅助功能接口集合，详情参阅 [Regular.dom]{@link https://regularjs.github.io/reference/#api-reference-other-regulardom}
     *
     * @member {Object}  module:pool/component-base/src/util.dom
     */
    exports.dom = Regular.dom;

    /**
     * 空函数
     *
     * @method  module:pool/component-base/src/util.noop
     * @returns {void}
     */
    exports.noop = Regular.util.noop;

    /**
     * 提取函数体内部注释内容
     *
     * @example
     *
     * var func = function(){/*
     *    <!doctype html>
     *    <html>
     *      <body>
     *        <h1>aaaaaa</h1>
     *      </body>
     *    </html>
     * * /};
     * var html = util.multiline(func.toString());
     *
     * @method  module:pool/component-base/src/util.multiline
     * @param   {String} func - 函数字符串
     * @returns {String} 函数体字符串
     */
    exports.multiline = function (func) {
        if (/^function\s*\(\)\s*\{\s*\/\*+\s*([\s\S]*)\s*\*+\/\s*\}$/.test(func)){
            return RegExp.$1;
        }
    };

    /**
     * 数据合并接口，直接修改 o1 的内容
     *
     * @method  module:pool/component-base/src/util.extend
     * @param  {Object}  o1             - 目标数据对象
     * @param  {Object}  o2             - 来源数据对象
     * @param  {Boolean} override       - 是否重写
     * @param  {Boolean} hasOwnProperty - 是否需要判断对象属性
     * @return {Object}  目标数据对象
     */
    exports.extend = function (o1, o2, override, hasOwnProperty) {
        for (var i in o2){
            if ((!hasOwnProperty || o2.hasOwnProperty(i)) &&
                (override || o1[i] === undefined)){
                o1[i] = o2[i];
            }
        }
        return o1;
    };
});
