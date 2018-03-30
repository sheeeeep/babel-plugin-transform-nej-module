const template = require('babel-template');

module.exports = {
    requireStat: template(`
        var IMPORT_NAME = require(SOURCE);
    `),
    emptyObjectStat: template(`
        var PARAM = {};
    `),
    emptyFuncStat: template(`
        var PARAM = function(){};
    `),
    emptyArrayStat: template(`
        var PARAM = [];
    `),
    emptyStringStat: template(`
        var PARAM = "";
    `),
    IEFFStat: template(`
        (function nejModule() {
            STATEMENTS
        }).call(window)
    `),
    exportStat: template(`
        module.exports = PARAM;
        return;
    `),
    outputResultInitStat: template(`
        var PARAM = exports;
    `)
}