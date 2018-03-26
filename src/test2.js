/**
 *  组件基类定义文件，不带UI效果
 *
 *  @version  1.0
 *  @author   edu <edu@corp.netease.com>
 *  @module   pool/component-base/src/base
 */
NEJ.define([
    'base/util',
    'base/event',
    'base/element',
    'pool/cache-base/src/setting',
    './util.js',
    './directive.js',
    'css!pool/res-base/css/icons.css'
],function(
    u, v, e,
    setting,
    util,
    directive,
    css
){
    // 加载字体文件
    e._$pushCSSText(css);

    /**
     * UI组件基类，组件池的所有组件均扩展于此基类
     *
     * @example
     *
     * NEJ.define([
     *      'pool/component-base/src/base'
     * ],function(
     *      Component
     * ){
     *      var Abc = Component.extends({
     *          config:function(){
     *              this.supr();
     *              // TODO
     *          },
     *          init:function(){
     *              this.supr();
     *              // TODO
     *          }
     *      });
     *      return Abc;
     * });
     *
     * @class module:pool/component-base/src/base.Component
     *
     * @param  {Object} options      - 组件构造参数
     * @param  {Object} options.data - 与视图关联的数据模型
     */
    var Component = Regular.extend({
        /**
         * 模板编译前用来初始化参数
         *
         * @protected
         * @method  module:pool/component-base/src/base.Component#config
         * @returns {void}
         */
        config: function(){
            // active css text
            e._$dumpCSSText();
            // set default value
            util.extend(this.data, {
                /**
                 * 是否可见
                 *
                 * @member {Boolean}  module:pool/component-base/src/base.Component#visible
                 */
                visible: true
            });
            // ensure use component options first
            this.supr();
        },

        /**
         * 模板编译之后(即活动dom已经产生)被调用, 可以在这里处理一些与dom相关的逻辑
         *
         * @protected
         * @method  module:pool/component-base/src/base.Component#init
         * @returns {void}
         */
        init: function(){
            this.supr();
        },

        /**
         * 组件销毁策略
         *
         * @protected
         * @method  module:pool/component-base/src/base.Component#destroy
         * @returns {void}
         */
        destroy:function(){
            // clear all global event
            u._$forEach(this._tmp_events,function (args) {
                v._$delEvent.apply(v,args);
            });
            delete this._tmp_events;
            this.supr();
        },

        /**
         * 根据配置和权限判断是否可见,用于在html中判断
         * 该方法先用于兼容k12和study教学 后续会抽离
         *
         * @public
         * @method module:pool/component-base/src/base.Component#isShow
         * @param  switcher 业务是否显示的开关
         * @returns {boolean}
         */
        isShow: function(switcher){
            return setting.isShow({
                "switcher": switcher,
                "key": this.settingKey
            });
        },

        /**
         * 设置默认配置信息
         *
         * @private
         * @method module:pool/component-base/src/base.Component#_flushSetting
         * @param   {String} key - 配置键
         * @param   {Object} map - 配置项
         * @returns {void}
         */
        _flushSetting: (function(){
            var kmap = {};
            return function (key, map) {
                if (!kmap[key]){
                    kmap[key] = !0;
                    setting.$default(key,map);
                }
            }
        })(),

        /**
         * 添加全局事件，通过此接口添加的事件在组件 destroy 时自动销毁
         *
         * @example
         *
         * this._addGlobalEvent([
         *      [window, 'scroll', function(event){}],
         *      [Klass, 'change', function(event){}]
         * ]);
         *
         * @protected
         * @method  module:pool/component-base/src/base.Component#_addGlobalEvent
         * @param   {Array} list - 事件列表，每个元素为 [element, type, handler] 数组
         * @returns {void}
         */
        _addGlobalEvent: function (list) {
            var cache = this._tmp_events;
            if (!cache){
                cache = [];
                this._tmp_events = cache;
            }
            u._$forEach(list,function (args) {
                v._$addEvent.apply(v,args);
                cache.push(args);
            });
        }
    }).directive(directive);
    
    /**
     * 组件扩展方法
     *
     * @example
     *
     * NEJ.define([
     *      'pool/component-base/src/base',
     *      'text!./base.css'
     * ],function(
     *      Component,
     *      css
     * ){
     *      var Abc = Component.extends({
     *          css:css,
     *          config:function(data){
     *              this.supr(data);
     *              // TODO
     *          },
     *          init:function(){
     *              this.supr();
     *              // TODO
     *          }
     *      });
     *      return Abc;
     * });
     *
     * @method  module:pool/component-base/src/base.Component.$extends
     * @param   {Object} options          - 配置信息
     * @param   {String} options.name     - 组件标签名称
     * @param   {String} options.css      - 组件的样式表
     * @param   {String} options.template - 组件的HTML结构
     * @returns {module:pool/component-base/src/base.Component} 组件类
     */
    Component.$extends = function ext(options){
        // cache css text
        if(typeof options.css==='string'){
            var css = options.css.trim();
            if (!!css){
                e._$pushCSSText(options.css);
            }
            delete options.css;
        }
        // delegate extends api
        var Comp = this.extend(options);
        Comp.$extends = ext;
        return Comp;
    };

    return Component;
});
