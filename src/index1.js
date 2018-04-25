let t;

module.exports = function (babel) {
    t = babel.types;

    const judgeModule = require('./judgeModule');
    const brokenModule = require('./brokenModule');
    const brokenDeps = require('./brokenDeps');
    const TEMPLATE = require('./TEMPLATE');
    const buildUtil = require('./buildUtil');
    const {returnVisitor, outputResultVisitor} = require('./visitors');

    return {
        visitor: {
            
            CallExpression(path, state) {
                const program = get(path, 'parentPath.parentPath');
                if (!t.isProgram(program)) {
                    return;
                }
                if (!isNejModule(path)) {
                    return;
                }

                const pathNode = path.node;

                
                //////// 获取回调函数 start ///////
                const callback = getCallback(pathNode.arguments, program);
                if (!callback) {
                    return;
                }
                
                callback.node.id = t.identifier('nejModule'); // return语句和其对应的函数确认眼神的信号
                //////// 获取回调函数 end ////////

                //////// return处理 start ////////
                callback.traverse(returnVisitor);
                //////// return处理 end ////////
                
                
                const cbStats = callback.node.body.body;
                const deps = getDeps(pathNode.arguments);
                const depsVal = get(callback, 'node.param').map(param => {
                    return param.name;
                });

                const { requireStats, txtModuleInitStats, injectParamStats, outputResult } = brokenDeps(deps, depsVal, opts)

                if(outputResult !== 'exports') {
                    callback.traverse(outputResultVisitor, { outputResult });
                }

                let stats = requireStats.concat(txtModuleInitStats).concat(injectParamStats).concat(cbStats)
                
                const rootFunc = TEMPLATE.IEFFStat({
                    STATEMENTS: stats
                });

                realCallback && realCallback.parentPath.remove();

                module.replaceWith(rootFunc);


            }
        }
    };
};
