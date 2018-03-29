const TEMPLATE = require('./TEMPLATE');
const t = require('babel-types');

const buildRequires = function (requires) {
    const stats = [];
    Object.keys(requires).forEach( source => {
        stats.push( TEMPLATE.requireStat({
            IMPORT_NAME: t.identifier(requires[source]),
            SOURCE: t.stringLiteral(source)
        }))
    })

    return stats;
};
const buildInjectParams = function (arr) {
    const o = arr[0], f = arr[1], r = arr[2];
    const stats = [];

    if (o) {
        stats.push(TEMPLATE.emptyObjectStat({
            PARAM: t.identifier(o)
        }));
    }

    if (f) {
        stats.push(TEMPLATE.emptyFuncStat({
            PARAM: t.identifier(f)
        }));
    }

    if (r) {
        stats.push(TEMPLATE.emptyArrayStat({
            PARAM: t.identifier(r)
        }));
    }

    return stats;
};

const buildEmptyStrings = function (arr) {
    stats = arr.map(s => {
        return TEMPLATE.emptyStringStat({
            PARAM: t.identifier(s)
        })
    });

    return stats;
}

const buildExport = function(param) {
    if (typeof param == "string") {
        param = t.identifier(param);
    }

    return TEMPLATE.exportStat({
        PARAM: param
    })
}
module.exports = {
    buildRequires,
    buildInjectParams,
    buildEmptyStrings,
    buildExport
}