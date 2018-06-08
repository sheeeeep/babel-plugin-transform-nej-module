/**
 *  输入组件基类文件
 *
 *  @version  1.0
 *  @module   pool/component-input/src/base/component
 */

NEJ.define([
    'pool/component-base/src/base',
    'pool/component-base/src/util',
    'pool/component-validation/src/validation',
    'base/platform'
], function(
    Component,
    util,
    Validation,
    platform
) {

    return Component.$extends({
        config: function() {
            util.extend(this.data, {
                value: '',
                state: 'normal',
                eltIE9: platform._$KERNEL.browser == 'ie' && platform._$KERNEL.version * 1 <= 5,
                /**
                 * placeholder的值
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#placeholder
                 */
                placeholder: '',
                /**
                 * input类型, 缺省为text
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#type
                 */
                type: 'text',
                /**
                 * 传入的校验规则
                 *
                 * @member {Array}  module:pool/component-input/src/base/component.BaseInput#rules
                 */
                rules: null,
                /**
                 * 在ui生成的时候focus到这个组件
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#autofocus
                 */
                autofocus: false,
                /**
                 * 在ui生成的时候自动选中内容
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#autofocus
                 */
                autoselect: false,

                /**
                 * 是否readonly
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#readonly
                 */
                readonly: false,
                /**
                 * 是否disabled
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#disabled
                 */
                disabled: false,
                /**
                 * 是否visible
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#visible
                 */
                visible: true,
                /**
                 * 是否要在输入的时候提示还剩多少字
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#autoValidating
                 */
                autoValidating: false,
                /**
                 * 是否要在获得焦点后清除错误
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#clearErrorOnfocus
                 */
                clearErrorOnfocus: true,

                /**
                 * 在输入框后显示的单位,ex: 斤.厘米等
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#unit
                 */
                unit: '',
                /**
                 * 补充的样式
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#class
                 */
                class: '',
                /**
                 * 尺寸
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#size
                 */
                size: 'base',
                /**
                 * 宽度
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#width
                 */
                width: '',
                /**
                 * 是否失焦就检测
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#blurValidate
                 */
                blurValidate: true,
                /**
                 * 是否有重置按钮
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#resetBtn
                 */
                resetBtn: false,
                /**
                 * input输入框前面的标签
                 *
                 * @member {String}  module:pool/component-input/src/base/component.BaseInput#addon
                 */
                addon: '',
                /**
                 * 是否过滤输入的 Emoji
                 *
                 * @member {Boolean}  module:pool/component-input/src/base/component.BaseInput#replaceEmoji
                 */
                replaceEmoji: true
            });

            this.supr();

        },
        /**
         * 模板编译 之后(即活动dom已经产生)被调用. 你可以在这里处理一些与dom相关的逻辑
         *
         * @protected
         * @method module:pool/component-input/src/base/component.BaseInput#init
         * @return {Void}
         */
        init: function() {
            this.supr();

            if (this.data.autofocus) {
                //init的时候，input即使存在但可能还没有显示，所以来个延迟
                window.setTimeout(function() {
                    this.focus();
                }._$bind(this), 50);
            }

            if (this.data.autoselect) {
                //init的时候，input即使存在但可能还没有显示，所以来个延迟
                window.setTimeout(function() {
                    this.select();
                }._$bind(this), 50);
            }

        },
        /**
         * 组件keyup的响应方法
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#onkeyup
         * @return {Void}
         */
        onkeyup: function(_event) {
            //ie9以下先赋值，否则validate更新不够及时
            if (this.data.eltIE9 && _event.target && _event.target.value != null) {
                this.data.value = _event.target.value;
            }

            /**
             * keyup事件
             *
             * @event module:pool/component-input/src/base/component.BaseInput#keyup
             * @param {Object} options            - 组件构造参数
             * @param {Object} options.sender     - 组件this
             * @param {String} options.value      - input内容
             *
             */
            if (this.data.isRealTime) {
                this.validate();
            }
            this.$emit('keyup', this.getReturnEvent(_event));

            if (_event.which == 13) {
                /**
                 * enter回车事件
                 *
                 * @event module:pool/component-input/src/base/component.BaseInput#enter
                 * @param {Object} options            - 组件构造参数
                 * @param {Object} options.sender     - 组件this
                 * @param {String} options.value      - input内容
                 *
                 */
                this.$emit('enter', this.getReturnEvent(_event));
            }
            if (_event.which == 38) {
                /**
                 * up事件
                 *
                 * @event module:pool/component-input/src/base/component.BaseInput#up
                 * @param {Object} options            - 组件构造参数
                 * @param {Object} options.sender     - 组件this
                 * @param {String} options.value      - input内容
                 *
                 */
                this.$emit('up', this.getReturnEvent(_event));
            }
            if (_event.which == 40) {
                /**
                 * down事件
                 *
                 * @event module:pool/component-input/src/base/component.BaseInput#down
                 * @param {Object} options            - 组件构造参数
                 * @param {Object} options.sender     - 组件this
                 * @param {String} options.value      - input内容
                 *
                 */
                this.$emit('down', this.getReturnEvent(_event));
            }
        },
        /**
         * 组件input的响应方法
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#onkeydown
         * @return {Void}
         */
        onkeydown: function(_event) {
            //ie9以下先赋值，否则validate更新不够及时
            if (this.data.eltIE9 && _event.target && _event.target.value != null) {
                this.data.value = _event.target.value;
            }

            /**
             * input事件
             *
             * @event module:pool/component-input/src/base/component.BaseInput#input
             * @param {Object} options            - 组件构造参数
             * @param {Object} options.sender     - 组件this
             * @param {String} options.value      - input内容
             *
             */
            if (this.data.isRealTime) {
                this.validate();
            }
            this.$emit('keydown', this.getReturnEvent());
        },
        /**
         * 组件input的响应方法
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#oninput
         * @return {Void}
         */
        oninput: function(_event) {
            //ie9以下先赋值，否则validate更新不够及时
            if (this.data.eltIE9 && _event.target && _event.target.value != null) {
                this.data.value = _event.target.value;
            }

            /**
             * input事件
             *
             * @event module:pool/component-input/src/base/component.BaseInput#input
             * @param {Object} options            - 组件构造参数
             * @param {Object} options.sender     - 组件this
             * @param {String} options.value      - input内容
             *
             */
            if (this.data.isRealTime) {
                this.validate();
            }
            this.$emit('input', this.getReturnEvent());
        },


        /**
         * 获取事件返回的内容
         *
         * @private
         * @method module:pool/component-input/src/base/component.BaseInput#getReturnEvent
         * @returns {{sender: this, value: value}}
         */
        getReturnEvent: function(event) {
            return {
                event: event,
                sender: this,
                value: this.data.value
            };
        },

        /**
         * 组件blur的响应方法
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#onblur
         * @return {Void}
         */
        onblur: function() {
            //UTF-8编码有可能是两个、三个、四个字节。Emoji表情是4个字节，而MySQL的utf8编码最多3个字节，过滤Emoji
            if (this.data.replaceEmoji && this.data.value && this.data.value.replace) {
                this.data.value = this.data.value.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
            }
            /**
             * @event module:pool/component-input/src/base/component.BaseInput#blur
             * @param {Object} options            - 组件构造参数
             * @param {Object} options.sender     - 组件this
             * @param {String} options.value      - input内容
             *
             */
            if (this.data.blurValidate) {
                this.validate();
            }
            this.$emit('blur', this.getReturnEvent());
        },
        /**
         * 组件focus的响应方法
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#onfocus
         * @return {Void}
         */
        onfocus: function() {
            /**
             * @event module:pool/component-input/src/base/component.BaseInput#focus
             * @param {Object} options            - 组件构造参数
             * @param {Object} options.sender     - 组件this
             * @param {String} options.value      - input内容
             */

            if (this.data.clearErrorOnfocus) {
                this.clearErrorMsg();
            }

            this.$emit('focus', this.getReturnEvent());
        },
        /**
         * 使组件focus
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#focus
         * @return {Void}
         */
        focus: function() {
            var _input = this.$refs && this.$refs.input;
            if (_input && typeof _input.focus === 'function') {
                _input.focus();
            }
        },
        /**
         * 使组件blur
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#blur
         * @return {Void}
         */
        blur: function() {
            var _input = this.$refs && this.$refs.input;
            if (_input && typeof _input.blur === 'function') {
                _input.blur();
            }
        },

        /**
         * 选中组件内容
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#select
         * @return {Void}
         */
        select: function() {
            var _input = this.$refs && this.$refs.input;
            if (_input && typeof _input.select === 'function') {
                _input.select();
            }
        },


        /**
         * 重置（清空）输入框中的内容
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#resetValue
         * @return {Void}
         */
        resetValue: function() {

            this.data.value = '';
            this.$update();
            /**
             * 点击删除按钮触发 reset事件，因为此时要求发请求
             *
             * @public
             * @event module:pool/component-input/src/search/component.Search#search
             * @param {String} value            搜索框的内容
             */

            //处理父子组件无法及时同步value值
            var that = this;
            window.setTimeout(function() {
                that.$emit('reset', {
                    value: that.data.value
                });
            }, 30);
        },

        /**
         * 使组件validate
         *
         * @public
         * @method module:pool/component-input/src/base/component.BaseInput#validate
         * @return {Void}
         */
        validate: function() {
            return !!this.$refs.validation && this.$refs.validation.validate(this.data.value, this.data.isRealTime);
        },

        /**
         * focus清空错误提醒
         */
        clearErrorMsg: function() {
            if (this.$refs.validation) {
                this.$refs.validation.data.message = '';
                this.$refs.validation.data.state = 'normal';
            }
        }
    });

});