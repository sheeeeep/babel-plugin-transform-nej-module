var f = function (a, b, c, d, e, f, g, h) {
    var a = 1;
    return a;
}

NEJ.define(['text!a.css', 'css!b.css', 'json!c.json', 'd.js'], f);

NEJ.define(function (_p, _o, _f, _r) {

    if (CMPT) {
        NEJ.copy = function (a, b) {
            return a;
        };
        // NEJ namespace
        NEJ = NEJ.copy(
            NEJ, {        
                P: function (_namespace) {
                    if (!_namespace || !_namespace.length) {
                        return null;
                    }
                    var _package = window;
                    for (var a = _namespace.split('.'),
                        l = a.length, i = (a[0] == 'window') ? 1 : 0; i < l;
                        _package = _package[a[i]] = _package[a[i]] || {}, i++);
                    return _package;
                }
            }
        );

        return NEJ;
    }

    return _p;
});

/**
 *  RegularJS 扩展组件定义
 *
 *  @version  1.0
 *  @author   edu <edu@corp.netease.com>
 *  @module   pool/component-base/src/component
 */
NEJ.define([
    'base/util'
],function (
    u,
    exports
) {
    exports.batchOverRide = function (list) {
        u._$forEach(list,function(it){
            exports.override(
                it.klass, it.overs
            );
        });
    };
    exports.override = function (Component, overs) {
        if (!Component||!overs){
            return;
        }
        u._$loop(overs, function (Klass, name) {
            Component.component(name, Klass);
        });
    }
});


