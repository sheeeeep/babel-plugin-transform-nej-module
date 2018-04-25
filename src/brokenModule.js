const t = require("babel-types");

module.exports = function ([deps, callback]) {
    let hasFindcallback = true;
    if (!callback) {
        callback = deps;
        deps = []
    } else {
        deps = deps.elements || [];
    }

    if (deps) {
        deps = deps.map(dep => {
            return dep.value;
        });
    }

    if (t.isIdentifier(callback)) {
        return {
            deps,
            callback: callback.name,
            hasFindcallback: false
        }
    }

    if (t.isFunctionExpression(callback)) {
        return {
            deps,
            callback,
            hasFindcallback: true
        }
    }

    return {
        deps: [],
        callback: null,
        hasFindcallback: false
    }
}