const t = require("babel-types");
const { get } = require('lodash');

module.exports = function isNejModule(path) {
    let calleeNameName = '';

    calleeName = get(path.node, 'callee.name', '');

    if (!calleeName) {
        calleeName = get(path.node, 'callee.object.name', '');
        calleeName += '.';
        calleeName += get(path.node, 'callee.property.name', '');
    }

    calleeName = calleeName.toLowerCase();
    if (calleeName != 'define' && calleeName != 'nej.define') {
        return false;
    }
    if (calleeName == 'define' && path.scope.hasBinding('define')) {
        return false;
    }

    return true;
};
