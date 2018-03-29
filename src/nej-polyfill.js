window.CMPT = false;

Function.prototype.callx = Function.prototype.call;

Function.prototype.call = function (that) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    if (!that) {
        return this.apply(window, args);
    } else {
        return this.apply(that, args);
    }
};