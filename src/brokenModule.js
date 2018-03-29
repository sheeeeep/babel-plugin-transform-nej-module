const t = require("babel-types");

module.exports = function ([deps, cb]) {
    let hasFindCb = true;
    if (!cb) {
        cb = deps;
        deps = []
    } else {
        deps = deps.node;
    }

    if (deps && deps.elements) {
        if (deps.elements.length) {
            deps = deps.elements.map(ele => {
                return ele.value;
            });
        } else {
            deps = [];
        }
    }

    if (t.isIdentifier(cb)) {
        return {
            deps,
            cb: cb.node.name,
            hasFindCb: false
        }
    }

    if (t.isFunctionExpression(cb)) {
        return {
            deps,
            cb,
            hasFindCb: true
        }
    }

    return {
        deps: [],
        cb: null,
        hasFindCb: false
    }
}