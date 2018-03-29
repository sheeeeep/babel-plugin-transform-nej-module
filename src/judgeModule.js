const t = require("babel-types");

const isDefine = function isDefine(callee) {
    return callee.name == 'define';
}

const isNejDefine = function isNejDefine(callee) {
    return t.isMemberExpression(callee) &&
        (callee.object && callee.object.name && callee.object.name.toLowerCase() === 'nej') &&
        (callee.property && callee.property.name === 'define')
}

module.exports = function isNejModule(callee) {
    return isDefine(callee) || isNejDefine(callee);
}