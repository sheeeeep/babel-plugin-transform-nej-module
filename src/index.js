const { get } = require('lodash');
const isNejModule = require('./judgeModule');
const brokenModule = require('./brokenModule');
const brokenDeps = require('./brokenDeps');
const { callbackVisitor } = require('./visitors');

const t = require("babel-types");

/**
 * 获取nej模块的依赖列表
 * @param {Array} arguments nej模块参数
 * @return {Array[String]} 依赖列表
 */
const getDeps = function getDeps(arguments) {
    if (arguments.length === 1) {
        return [];
    } else {
        return (arguments[0].elements || []).map(dep => {
            return dep.value;
        });
    }
};

/**
 * 获取回调函数
 * @param {Array} arguments 
 * @param {Object} program 
 */
const getCallback = function getCallback(arguments, program) {
    let callback = arguments[1] || arguments[0];
    const callbackVisitor = {
        // var foo = function() {...};
        VariableDeclarator(path) {
            const left = path.node.id;
            const right = path.node.init;
            if (!t.isIdentifier(left) || !t.isFunctionExpression(right)) {
                return;
            }
            if (left.name === this.param) {
                callback = path.get('init');
            }
        },
        // foo = function() {...}
        AssignmentExpression(path) {
            const left = path.node.left;
            const right = path.node.right;
            if (!t.isIdentifier(left) || !t.isFunctionExpression(right)) {
                return;
            }
            if (left.name === this.param) {
                callback = path.get('right');
            } 
        }
    };

    if (t.isFunctionExpression(callback)) {
        return callback;
    }

    if (t.isIdentifier(callback)) {
        const callbackName = callback.name;
        program.traverse(callbackVisitor, { param: callbackName });
        return callback;
    }

    return null;
};

module.exports = function(babel) {
    const t = babel.types;

    return {
        visitor: {
            CallExpression(path, state) {
                const program = get(path, 'parentPath.parentPath');
                if (!t.isProgram(program)) {
                    return;
                }

                const pathNode = path.node;

                if (!isNejModule(path)) {
                    return;
                }

                const deps = getDeps(pathNode.arguments);

                // 获取回调函数 start
                const callback = getCallback(pathNode.arguments, program);
                if (!callback) {
                    return;
                }

                callback.node.id = t.identifier('nejModule'); // return语句和其对应的函数确认眼神的信号
                // 获取回调函数 end

                const depsVal = get(callback, 'node.param').map(param => {
                    return param.name;
                });
                brokenDeps(deps, depsVal);
            }
        }
    };
};
