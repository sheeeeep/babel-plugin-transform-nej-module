/**
 * ComponentAudioPlayer 组件实现文件
 *
 * @version  1.0
 * @author   hzyuwei <hzyuwei@corp.netease.com>
 * @module   pool/component-audio-player/src/component_audio_player/component
 */
NEJ.define([
    'pool/component-base/src/base',
    'pool/component-base/src/util',
    'pool/cache-base/src/setting',
    'util/cache/cookie',
    'base/util',
    'pool/edu-front-util/src/timeUtil',
    'pool/edu-front-util/src/mobileUtil',
    '../setting.js',
    '../status.js',
    '../util.js',
    '../flash-audio-player/player.js',
    '../h5-audio-player/player.js',
    'pool/edu-front-util/src/nosUtil',
    'pool/component-editor/src/editor/eduEditor/parseUtil'
],function(
    Component,
    util,
    s,
    Cookie,
    NEJUtil,
    timeUtil,
    mobileUtil,
    conf,
    STATUS,
    AudioUtil,
    FlashPlayer,
    H5Player,
    nosUtil,
    parseUtil
){
    var SETTING_KEY = 'component-audio-player';

    var PlayStatusMap = {
        "IDLE": 0,
        "BUFFERING": 0,
        "PLAYING": 1,
        "PAUSED": 2
    };

    var PlayerType = {
        "FLASH": 0,
        "H5": 1
    };

    var CONST = {
        "STARTPOINT": 0
    };

    // 音频 视频 共用一个音量配置
    var COOKIEMAP = {
        'AUDIO_VOLUME': "videoVolume",
        'AUDIO_LYRIC_TIP': "audioLyricTip",
        'AUDIO_RATE_TIP': "audioRateTip"
    };

    var rate = [0.75, 1, 1.25, 1.5, 1.75, 2];
    var rate4wap = [1, 1.25, 1.5];
    /**
     * ComponentAudioPlayer 组件
     *
     * @class   module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer
     * @extends module:pool/component-base/src/base.Component
     *
     * @param {Object} options      - 组件构造参数
     * @param {Object} options.data - 与视图关联的数据模型
     */
    var ComponentAudioPlayer = Component.$extends({
        /**
         * 模板编译前用来初始化参数
         *
         * @protected
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#config
         * @returns {void}
         */
        config: function () {
            this._flushSetting(SETTING_KEY, conf);

            this._setConfigDataFromCookie();
            this._setFlashNameSpace();

            util.extend(this, {
                PlayStatusMap: PlayStatusMap,
                PlayerType: PlayerType,
                setting: s.get(SETTING_KEY),
                rate: rate
            });
            

            util.extend(this.data, {
                /**
                 * 音频文件地址
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#file
                 */
                file: "",
                /**
                 * 自动播放
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#file
                 */
                autoStart: this.setting.AUTOSTART,
                /**
                 * 初始化视频播放器音量，如果没传则从cookie中读取，没有则使用默认值0.8(范围0-1)
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#volume
                 */
                volume: this.setting.VOLUME,
                /**
                 * 是否静音
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#mute
                 */
                mute: this.setting.MUTE,
                /**
                 * 倍速播放提示
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#rateTip
                 */
                showRateTip: this.setting.SHOWRATETIP,
                needShowRateTip: false,

                /**
                 * 是否显示倍数按钮
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#showRate
                 */
                showRate: this.setting.SHOWRATE,

                /**
                 * 文稿切换提示
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#showLyricTip
                 */
                showLyricTip: this.setting.SHOWLYRICTIP,
                needShowLyricTip: false,
                /**
                 * 音频长度
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#duration
                 */
                duration: 0,
                playPercent: 0,
                rate: 1,
                /**
                 * 播放位置
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#position
                 */
                position: 0,
                /**
                 * 字幕文件地址
                 *
                 * 不传不显示文稿按钮
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#lyricFile
                 */
                lyricFile: "",
                /**
                 * 是否显示背景画布
                 *
                 * @member module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#stage
                 */
                stage: false,
                beginOffset: 11,
                endOffset: 11
            });

            if(this.data.duration && this.data.position){
                this.data.playPercent = this.data.position / this.data.duration;
            }

            //安卓则不显示音频变速按钮
            if(!!mobileUtil._$isAndroid()){
                this.data.showRate = false;
            }
            

            this.supr();
        },

        /**
         * 模板编译之后(即活动dom已经产生)处理逻辑，可以在这里处理一些与dom相关的逻辑
         *
         * @protected
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#init
         * @returns {void}
         */
        init: function () {
            this.supr();

            this._initFlashPlayer();
            this._initPlayerEvent();

            // 自动播放
            if(this.data.autoStart){
                setTimeout(function(){
                    this.resume();
                }._$bind(this), 500);
            }
            // 倍速提示
            if(this.data.showRateTip) {
                this._showRateTip();
            }
        },

        _initFlashPlayer: function () {
            var config = {
                parent : this.$refs.parentNode,
                data : {
                    file: this.data.file
                },
                conf: this.setting
            };

            //处理NOS音频
            // 不能这么搞 大于100M 音频挂了
            // if(config.data.file.indexOf('edu-media') > 0){
            //     config.data.file += '?audioTrans&type=mp3';
            // }

            if(AudioUtil.support() && this.setting['SUPPORT_H5']){

                this.data.type = PlayerType.H5;
                this._AudioPlayer = H5Player._$$H5AudioPlayer._$allocate(config);
            }else{
                util.extend(config.data, config.conf);

                this.data.type = PlayerType.FLASH;
                this._AudioPlayer = FlashPlayer._$$FlashAudioPlayer._$allocate(config);
            }
        },

        /**
         * 组件销毁策略，如果有使用第三方组件务必在此先销毁第三方组件再销毁自己
         *
         * @protected
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#destroy
         * @returns {void}
         */
        destroy: function () {
            this.supr();

            if(AudioUtil.support() && this.setting['SUPPORT_H5']){
                this._AudioPlayer = H5Player._$$H5AudioPlayer._$recycle(this._AudioPlayer);
            }else{

                this._AudioPlayer = FlashPlayer._$$FlashAudioPlayer._$recycle(this._AudioPlayer);
            }
        },

        /**
         * 从浏览器cookie中获取配置信息，重置配置信息
         *
         * @private
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_setConfigDataFromCookie
         * @returns {void}
         */
        _setConfigDataFromCookie: function () {
            // cookie中的信息
            var _audioVolume = Cookie._$cookie(COOKIEMAP.AUDIO_VOLUME) || undefined;
            var _audioMute = _audioVolume === 0;

            _audioVolume = (_audioVolume == '' ? undefined : _audioVolume);
            _audioMute = (_audioMute ? undefined : _audioMute);

            s.set(SETTING_KEY, NEJUtil._$fetch(s.get(SETTING_KEY), {
                VOLUME : _audioVolume,
                MUTE : _audioMute
            }));
        },

        /**
         * 设置Flash的配置信息
         *
         * @private
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_setConfigDataFromCookie
         * @returns {void}
         */
        _setFlashNameSpace: function () {
            if (!s.get(SETTING_KEY)["namespaceStudy"]) {
                s.set(SETTING_KEY, {
                    "namespaceStudy": 'edu.front.flashAudioPlayer' + NEJUtil._$randNumberString(2)
                });
            }
        },

        /**
         * 显示声音控制条
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#onMouseOverVolume
         * @return void
         */
        onMouseOverVolume: function () {
            this.data.showVolumeCtrl = 1;

            this.$refs.volumeRange.calculateTrack();

        },


        /**
         * 切换显示字幕
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#switchLyric
         * @return void
         */
        switchLyric: function () {
            if(!this.data.lyric){
                nosUtil._$getNosText(this.data.lyricFile, {
                    onload: function(_lyric){
                        this.data.lyric = _lyric;
                        this.$update();
                    }._$bind(this),
                    onerror: function(){

                    }
                });
            }

            this.data.showLyric = !this.data.showLyric;
            if(this.data.showLyricTip) {
                this._showLyricTip();
            }
        },

        /**
         * 切换倍速 wap
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#switchRate
         * @return void
         */
        switchRate: function() {
            var nextRate;
            for(var i=0;i<rate4wap.length;i++) {
                if(rate4wap[i] == this.data.rate) {
                    nextRate = rate4wap[i+1] || rate4wap[0];
                    break;
                } 
            }
            this.setPlayRate(nextRate);
            this.$update();
        },

        /**
         * 显示文稿切换提示
         *
         * @private
         * @method module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_showLyricTip
         * @return void
         */
        _showLyricTip: function() {
            if(!this.data.needShowLyricTip && !Cookie._$cookie(COOKIEMAP.AUDIO_LYRIC_TIP)) {
                this.closeRateTip();
                this.data.needShowLyricTip = true;
            } else {
                this.closeLyricTip()
            }
            this.$update();
        },

        /**
         * 关闭文稿切换提示
         *
         * @public
         * @method module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#closeLyricTip
         * @return void
         */
        closeLyricTip: function() {
            this._setCookie(COOKIEMAP.AUDIO_LYRIC_TIP, 1);
            this.data.needShowLyricTip = false;
            this.$update();
        },

        /**
         * 设置COOKIE
         *
         * @private
         * @method module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_setCookie
         * @param {String} cookieName
         * @param {String} value
         * @return void
         */
        _setCookie: function (cookieName, value) {
            Cookie._$cookie(cookieName, {path:'/',domain: conf.DOMAIN, value:value + '', expires:365});
        },

        /**
         * 监听播放器事件
         *
         * @private
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_initPlayerEvent
         * @returns {void}
         */
        _initPlayerEvent: function () {
            this._AudioPlayer._$addEvent('onError', function(_error){
                this.$emit('onError', _error);
            }._$bind(this));

            this._AudioPlayer._$addEvent('onState', function(_state){
                _state = _state.toUpperCase();

                if(_state == STATUS.ENDED){
                    this._setStatus(_state);
                    this.$emit('onEnded');
                }
                this._setStatus(_state);
                this.$emit('onState', _state);
            }._$bind(this));

            this._AudioPlayer._$addEvent('onBuffer', function(_bufferPercent){
                this.data.bufferPercent = _bufferPercent || 0;
                this.$update();
            }._$bind(this));

            this._AudioPlayer._$addEvent('onTime', this._updatePlayProgress._$bind(this));

            this._AudioPlayer._$addEvent('onLoadedMetaData', this._onLoadedMetaData._$bind(this))
        },

        /**
         * 设置状态
         *
         * @private
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_setStatus
         * @return void
         */
        _setStatus: function (_status) {
            this.data.play_status = PlayStatusMap[_status];
            this.$update();
        },

        /**
         * 更新播放进度
         *
         * @private
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_updatePlayProgress
         * @return void
         */
        _updatePlayProgress: function (_data) { 
            this.data.position = Math.ceil(_data.position);
            this.data.playPercent = _data.position / _data.duration;
            this.$update();

            this.$emit('onTime', _data);

        },

        _onLoadedMetaData: function(_duration) {
            if(!this.data.duration) {
                this.$update('duration', _duration)
            }
        },

        /**
         * 显示倍速播放提示
         *
         * @private
         * @method module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#_showRateTip
         * @return void
         */
        _showRateTip: function() {
            if(!Cookie._$cookie(COOKIEMAP.AUDIO_RATE_TIP)) {
                this.data.needShowRateTip = true;
                this.$update();
            }
        },

        /**
         * 关闭倍速播放提示
         *
         * @public
         * @method module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#closeRateTip
         * @return void
         */
        closeRateTip: function() {
            this._setCookie(COOKIEMAP.AUDIO_RATE_TIP, 1);
            this.data.needShowRateTip = false;
            this.$update();
        },

        /**
         * 修改音量
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#rangeVolume
         * @return void
         */
        rangeVolume: function (value) {
            this.setVolume(value);
        },

        /**
         * 静音
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#mute
         * @return void
         */
        mute: function () {
            this.setVolume(0.0);
        },

        /**
         * 取消静音
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#unmute
         * @return void
         */
        unMute: function () {
            this.data.volume = this._volume || 0.1;

            this.setVolume(this.data.volume);
        },

        /**
         * 调整播放速率
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#setPlayRate
         * @return void
         */
        setPlayRate: function (_rate) {
            this.data.rate = _rate;
            this.data.showRateCtrl = 0;
            this.setting['SUPPORT_H5'] && this._AudioPlayer && this._AudioPlayer._$setPlayRate(_rate);
        },

        /**
         * 显示倍速播放控制面板
         *
         * @public
         * @method module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#showRateCtrl
         * @return void
         */
        showRateCtrl: function() {
            if(this._hideRateCtrlTimeout){
                this._hideRateCtrlTimeout = window.clearTimeout(this._hideRateCtrlTimeout);
            }

            this.data.showRateCtrl = 1;
            this.closeRateTip();
            if(this.data.needShowLyricTip) {
                this.closeLyricTip();
            }
            this.$update();
        },

        /**
         * 隐藏倍速播放控制面板
         *
         * @public
         * @method module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#hideRateCtrl
         * @return void
         */
        hideRateCtrl: function () {
            this._hideRateCtrlTimeout = window.setTimeout(function () {
                this.data.showRateCtrl = 0;
                this.$update();
            }._$bind(this), 100);
        },

        /**
         * 停止当前音频播放
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#stop
         * @return void
         */
        stop: function(){
            this._AudioPlayer && this._AudioPlayer._$stop();
        },

        /**
         * 加载新音频
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#load
         * @return void
         */
        load: function(_audioData){
            this._AudioPlayer && this._AudioPlayer._$load(_audioData);
        },

        /**
         * 暂停
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#pause
         * @return void
         */
        pause: function(){
            this._setStatus(STATUS.PAUSED);

            this._AudioPlayer && this._AudioPlayer._$pause();
        },

        /**
         * 恢复
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#resume
         * @return void
         */
        resume: function(){
            this._setStatus(STATUS.PLAYING);

            this._AudioPlayer && this._AudioPlayer._$resume();

            if(this.data.position >= 0){
                this.seek(this.data.position);
            }

            this.$emit('play');
        },

        /**
         * 重播
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#replay
         * @return void
         */
        replay: function () {
            this.seek(CONST.STARTPOINT);
            this.resume();
        },

        /**
         * 获取当前播放的时间
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#getPosition
         * @param {Function}   _callback      回调对象：function(_positionTime){}
         * @return {void}
         */
        getPosition: function(_callback){
            this._AudioPlayer && this._AudioPlayer._$getPosition(_callback);
        },

        /**
         * 设置跳转到对应的时间,用于驻点播放
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#seek
         * @return {void}
         */
        seek: function(position){

            this.data.position = position;

            // 如果正在播放则seek到播放点，如果没有在播放，缓存下次开始播放的点
            if( this.data.play_status == PlayStatusMap.PLAYING){
                this._AudioPlayer && this._AudioPlayer._$seek(position);
                this._setStatus(STATUS.PLAYING);
            }else{
                this._setStatus(STATUS.PAUSED);

            }
        },

        seekByPercent: function (_seekPercent) {
            var position = Math.floor(_seekPercent * this.data.duration);
            this.seek(position);
        },

        /**
         * 设置播放器音量大小
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#setVolume
         * @param   {Number}    _volume     音量大小
         * @return {void}
         */
        setVolume: function (_volume) {
            this._volume = this.data.volume;
            this.data.volume = _volume;

            this._AudioPlayer && this._AudioPlayer._$setVolume(this.data.volume);
            this._setCookie(COOKIEMAP.AUDIO_VOLUME, _volume);
            this.$update();
        },

        /**
         * 获取播放器的状态
         *
         * @public
         * @method  module:pool/component-audio-player/src/component_audio_player/component.ComponentAudioPlayer#getState
         * @param {Function} _callback 回调对象：function(_state){}
         * @return {String} "IDLE","BUFFERING","PLAYING", "PAUSED"
         */
        getState: function(_callback){
            this._AudioPlayer && this._AudioPlayer._$getState(_callback);
        }
    }).filter({
        "formatTime": timeUtil._$Millisec2Str,
        "renderRich": parseUtil._$renderRich2
    });

    return ComponentAudioPlayer;
});
