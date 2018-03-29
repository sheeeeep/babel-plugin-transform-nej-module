let t;

module.exports = function (babel) {
    t = babel.types;

    const judgeModule = require('./judgeModule');
    const brokenModule = require('./brokenModule');
    const brokenDeps = require('./brokenDeps');
    const TEMPLATE = require('./TEMPLATE');
    const buildUtil = require('./buildUtil');

    return {
        visitor: {
            Program(path, state) {
                const modules = [];
                const { opts } = state;

                // 只判断第一层代码是否有nej模块
                path.get('body').forEach(stat => {
                    let isModule = false, node = stat.node;
                    if (node && node.expression && node.expression.callee) {
                        isModule = judgeModule(node.expression.callee)
                        if (isModule) {
                            modules.push(stat.get('expression'));
                        }
                    }
                })

                modules.forEach(module => {
                    const callbackVisitor = {
                        VariableDeclarator(path) {
                            if (t.identifier(path.node.id.name) && path.node.id.name === this.param) {
                                realCallback = path.get('init');
                            }
                        }
                    }

                    const returnVisitor = {
                        ReturnStatement(path) {
                            const funcParent = path.getFunctionParent();
                            let funcName;
                            try {
                                if (funcParent && funcParent.node && funcParent.node.id && (funcParent.node.id.name === 'nejModule')) {
                                    path.replaceWith(buildUtil.buildExport(path.node.argument.name));
                                    hasReturn = true;
                                }
                            } catch (e) {
                            }
                        }
                    }

                    const moduleNode = module.node;
                    let hasReturn = false, realCallback;

                    let { deps, cb, hasFindCb } = brokenModule(module.get('arguments'));

                    // 如果找不到(当传入的回调函数为参数时，需要继续寻找其值)
                    if (!hasFindCb) {
                        // 只寻找同层代码
                        module.parentPath.parentPath.traverse(callbackVisitor, { param: cb })
                        if (realCallback) {
                            cb = realCallback;
                        } else {
                            return;
                        }
                    } 
                    
                    cb.node.id = t.identifier('nejModule'); // return语句和其对应的函数确认眼神的信号
                    cb.traverse(returnVisitor);

                    const cbStats = cb.node.body;
                    const depsVal = cb.node.params.map(param => {
                        return param.name;
                    });
                    const { requireStats, txtModuleInitStats, injectParamStats, outputResultExportStat } = brokenDeps(deps, depsVal, opts)

                    let stats = requireStats.concat(txtModuleInitStats).concat(injectParamStats).concat(cbStats)
                    if(!hasReturn) {
                        stats = stats.concat(outputResultExportStat);
                    }

                    const rootFunc = TEMPLATE.IEFFStat({
                        STATEMENTS: stats
                    });

                    realCallback && realCallback.parentPath.remove();

                    module.replaceWith(rootFunc);
                });
            }
        }
    };
};
