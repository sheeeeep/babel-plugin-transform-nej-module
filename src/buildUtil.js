const TEMPLATE = require('./TEMPLATE');
const t = require('babel-types');

const buildRequires = function (requires) {
    const stats = [];
    Object.keys(requires).forEach(source => {
        stats.push(TEMPLATE.requireStat({
            IMPORT_NAME: t.identifier(requires[source]),
            SOURCE: t.stringLiteral(source)
        }))
    })

    return stats;
};
const buildInjectParams = function (arr) {
    const pro = arr[0], o = arr[1], f = arr[2], r = arr[3];
    let stats = [];

    if (pro) {
        if (pro !== 'exports') {
            stats.push(
                TEMPLATE.outputResultInitStat({
                    PARAM: t.identifier(pro)
                })
            );
        }

    }

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

const buildExport = function (param) {
    if (!param) {
        param = t.objectExpression([]);
    }
    const type = typeof param;

    switch (type) {
        case 'string':
            param = t.stringLiteral(param);
            break;
        case 'number':
            param = t.numericLiteral(param);
            break;
        default:
            break;
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