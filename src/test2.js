/**
 *  Radio 组件实现文件 RegularUI -radio2-搬迁
 *
 *  @version  1.0
 *  @author   hztianxiang <hztianxiang@corp.netease.com>
 *  @module   pool/component-check/src/radio/component
 */

NEJ.define([
    'pool/component-base/src/base',
    'pool/component-base/src/util'
], function (
    Component,
    util
) {
    /**
     *  Radio组件
     *
     *  @class   pool/component-check/src/radio/component.Radio
     *  @extends module:pool/component-check/src/check/compoent.Check
     *
     *  @param {Object} options
     *  @param {Object} options.data    与视图关联的数据模型
     *  @param {String}                [options.data.name='']                    - radio按钮的文字
     *  @param {string}                 [options.data.contentTemplate='']         - radio按钮html内容
     *  @param {Boolean}               [options.data.checked=false]              - radio选按钮的选择状态。`false`表示未选，`true`表示已选
     *  @param {Boolean}               [options.data.block=false]                - 是否以block方式显示
     *  @param {Boolean}               [options.data.disabled=false]             - 是否禁用
     *  @param {Number}                [options.data.class'']                    - 补充class
     */


    /**
     * @event @event pool/component-check/src/radio/component.Radio#check
     * @param {Object} event - 事件
     * @param {Number} event.sender - 事件发送对象
     * @property {boolean} event.checked 选中状态
     */
    var Radio = Component.$extends({
        name: "ux-radio",

        /**
         * 模板编译前用来初始化参数
         *
         * @protected
         * @method pool/component-check/src/radio/component.Radio#config
         * @param  {Object} data - 与视图关联的数据模型
         * @return {void}
         */
        config: function (data) {
            util.extend(this.data, {
                /**
                 * 补充样式
                 *
                 * @member {String} module:pool/component-check/src/radio/component.Radio#class
                 */
                'class': '',
                /**
                 *  按钮文字
                 *
                 * @member {String} module:pool/component-check/src/radio/component.Radio#name
                 */
                name: '',

                /**
                 * html格式按钮内容
                 *
                 * @member {Boolean} module:pool/component-check/src/radio/component.Radio#contentTemplate
                 */
                contentTemplate:'',
                
                /**
                 * 是否选中
                 *
                 * @member {Boolean} module:pool/component-check/src/radio/component.Radio#checked
                 */
                checked: false,

                /**
                 * 是否禁用
                 *
                 * @member {Boolean} module:pool/component-check/src/radio/component.Radio#disabled
                 */
                disabled: false,

                /**
                 * 是否以block方式显示
                 *
                 * @member {Boolean} module:pool/component-check/src/radio/component.Radio#block
                 */
                block: false
            });
            // TODO
            this.supr(data);
        },

        /**
         * 设置选中
         * @public
         * @method pool/component-check/src/radio/component.Radio#check
         * @return {void}
         */
        check: function () {
            if (this.data.readonly || this.data.disabled) {
                return;
            }

            this.data.checked = true;


            this.$emit('check', {
                sender: this,
                checked: this.data.checked
            });
        },

        /**
         * 校验函数
         *
         * @public
         * @method pool/component-check/src/radio/component.Radio#validate
         * @returns {object} result  返回结果
         * @returns {boolean} result.success     => 是否通过
         * @returns {boolean} result.message     => 消息
         */
        validate: function () {
            return !!this.$refs.validation && /* istanbul ignore next  */ this.$refs.validation.validate();
        }
    });

    return Radio;
});
