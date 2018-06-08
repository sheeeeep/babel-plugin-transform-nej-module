/**
 *  ModalUI 组件带默认UI实现文件
 *
 *  @version  1.0
 *  @module   pool/component-modal/src/modal/web/ui
 */
(function nejModule() {
    var Component = require('../component');

    var html = require('./component.html');

    var css = require('./component.css');

    var css = "";

    /**
     *  ModalUI组件
     *
     *  @class   pool/component-modal/src/modal/web/ui.ModalUI
     *  @extends pool/component-base/src/base.Base
     *
     *  @param {Object} options
     *  @param {Object} options.data 与视图关联的数据模型
     */
    var uxModal = Component.$extends({
        name: "ux-modal",
        css: css,
        template: html
    });

    /**
     * 弹出一个alert对话框。关闭时始终触发确定事件。
     *
     * @static
     * @method module:pool/component-modal/src/modal/web/ui.ModalUI#alert
     * @param  {string} [content='']      - 对话框内容
     * @param  {string} [title='提示']    - 对话框标题
     * @param  {bool} [okButton= true]    - 是否展示确定按钮
     * @param  {string} [type='warning']  - 对话框类型
     * @return {Modal} modal              - 返回该对话框
     */
    uxModal.alert = function(content, title, okButton, type, klass) {
        var modal = new uxModal({
            data: {
                'class': klass,
                content: content,
                title: title,
                okButton: okButton,
                type: type || 'warning'
            }
        });
        return modal;
    };

    /**
     * 弹出一个confirm对话框
     *
     * @static
     * @method module:pool/component-modal/src/modal/web/ui.ModalUI#confirm
     * @param  {string} [content='']        - 对话框内容
     * @param  {string} [title='提示']      - 对话框标题
     * @param  {bool} [okButton= true]      - 是否展示确定按钮
     * @param  {bool} [cancelButton= true]  - 是否展示取消按钮
     * @param  {string} [type='warning']    - 对话框类型
     * @param  {node} [type= node]          - nodePointer 打点的起始dom
     * @return {Modal} modal                - 返回该对话框
     */
    uxModal.confirm = function(content, title, okButton, cancelButton, type, nodePointer, klass) {
        var modal = new uxModal({
            data: {
                'class': klass,
                content: content,
                title: title,
                okButton: okButton,
                cancelButton: cancelButton == null ? true : cancelButton,
                type: type || 'warning'
            },
            nodePointer: nodePointer
        });
        return modal;
    };
    module.exports = uxModal;
    return;
}).call(window);