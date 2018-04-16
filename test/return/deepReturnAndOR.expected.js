(function nejModule() {
    var pro = exports;

    var flag = true;

    function temp() {
        return pro;
    }

    exports.xxx = 'aaa';

    exports.name = function () {
        console.log('hello' + pro.xxx);
    };

    if (flag) {
        module.exports = exports;
        return;
    }

    module.exports = xxx;
    return;
}).call(window);
