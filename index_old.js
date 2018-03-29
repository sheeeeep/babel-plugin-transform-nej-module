let t;

module.exports = function (babel) {
    t = babel.types;
    let hasReturn = false;
    let randomValCount = 0;
    let txtDeps = [];
    let realCallback;

    const getParamFromCallBack = function getParamFromCallBack(callback) {
        let depsVal = [],
            cbContent = [],
            hasReturn = false,
            exportStatement = []
            ;
        if (!t.isFunctionExpression(callback)) {
            return {
                depsVal, cbContent, exportStatement
            }
        }

        depsVal = callback.params.map(param => {
            return param.name;
        });

        cbContent = callback.body.body;

        return { depsVal, cbContent, exportStatement };
    }

    const normalizeDep = function normalizeDep(dep, opts) {
        function dropPrefix(dep) {
            const [prefix, rawDep] = dep.split('!');

            if (prefix === 'css' || prefix === 'json' || prefix === 'text') {
                txtDeps.push(dep);
            }

            dep = rawDep ? rawDep : prefix;

            return dep;
        }
        function dropJSExt() {
            const [fileName, fileExt] = dep.split('/').reverse()[0].split('.');

            if (fileExt === 'js') {
                dep = dep.replace('.js', '');
            }
            return dep;
        }

        function assignMode(dep) {
            return dep.replace('{mode}', opts.mode);
        }

        function processPlatform(dep) {
            return dep.replace('{platform}', './{platform}');
        }

        function dropBracket(dep) {
            const leftPos = dep.indexOf('{'),
                rightPos = dep.indexOf('}');

            if (leftPos >= 0) {
                if (rightPos > 0 && dep[rightPos + 1] !== '/') {
                    dep = dep.replace('}', '/');
                } else {
                    dep = dep.replace('}', '');
                }

                dep = dep.replace('{', '');
            }
            return dep;
        }

        dep = dropPrefix(dep);
        dep = dropJSExt(dep);
        dep = assignMode(dep);
        dep = processPlatform(dep);
        dep = dropBracket(dep);

        return dep;
    }

    const createRequire = function createRequire(val, dep, opts) {
        dep = normalizeDep(dep, opts);

        if (!val) {
            val = `randomVal${++randomValCount}`;
        }

        const require = t.variableDeclaration('var', [
            t.variableDeclarator(t.identifier(val), t.callExpression(t.identifier('require'), [
                t.stringLiteral(dep)
            ]))
        ]);

        return require;
    }

    const createExports = function createExports(exportObj) {
        if (typeof exportObj == "string") {
            exportObj = t.identifier(exportObj);
        }

        if (!exportObj) {
            exportObj = t.objectExpression([]);
        }

        return t.expressionStatement(t.assignmentExpression(
            '=',
            t.memberExpression(
                t.identifier('module'),
                t.identifier('exports')
            ),
            exportObj
        ));
    }

    const createReturn = function createReturn(returnObj) {
        if (typeof returnObj == "string") {
            returnObj = t.identifier(returnObj);
        }

        return t.returnStatement(returnObj);
    }

    const isNejModule = function isNejModule(callee) {
        function isDefine(callee) {
            return callee.name == 'define';
        }

        function isNejDefine(callee) {
            return t.isMemberExpression(callee) &&
                (callee.object && callee.object.name && callee.object.name.toLowerCase() === 'nej') &&
                (callee.property && callee.property.name === 'define')
        }

        return isDefine(callee) || isNejDefine(callee);
    }

    const getParentFuncCount = function getParentFuncCount(node, count) {
        let nextNode;
        if (node.parent.type === "FunctionDeclaration" || node.parent.type === "FunctionExpression") {
            ++count;
        }

        try {
            nextNode = node.parentPath;
        } catch (e) {
            nextNode = null;
        }

        if (nextNode) {
            return getParentFuncCount(nextNode, count);
        } else {
            return count;
        }

    }

    const callbackVisitor = {
        VariableDeclarator(path) {
            if (t.identifier(path.node.id.name) && path.node.id.name === this.param) {
                realCallback = path.get('init');
            }
            return realCallback;
        }
    }

    const returnVisitor = {
        
    }

    return {
        visitor: {
            CallExpression: {
                exit(path, state) {
                    const opts = state.opts;
                    const mainContent = path.node;
                    const callee = mainContent.callee,
                        args = mainContent.arguments;
    
                    if (!callee) {
                        return;
                    }
    
                    if (!isNejModule(callee)) {
                        return;
                    }
    
                    let callback, deps;
                    if (args.length === 1) {
                        callback = args[0];
                        deps = [];
                    } else {
                        callback = args[1];
                        deps = args[0].elements.map(element => {
                            return element.value;
                        });
                    }
    
                    if (t.isIdentifier(callback)) {
                        path.parentPath.parentPath.traverse(callbackVisitor, { param: callback.name })
                        if (realCallback) {
                            callback = realCallback.node;
                            realCallback.parentPath.remove();
                        } else {
                            return;
                        }
                    }
    
                    hasReturn = false;
    
                    let { depsVal, cbContent, exportStatement = [] } = getParamFromCallBack(callback);
    
                    const requires = deps.map((dep, idx) => {
                        return createRequire(depsVal[idx], dep, opts); // var depsVal[idx] = require('dep');
                    })
    
                    const injectStatements = [];
                    // let returnStatement = [];
                    const injectParams = depsVal.splice(requires.length);
                    injectParams.forEach((injectParam, idx) => {
                        if (idx === 0) {
                            // if (!exportStatement.length) { exportStatement = createExports(injectParam); }
                            if(!hasReturn) exportStatement = createExports(injectParam);
                            injectStatements.push(t.variableDeclaration('var', [
                                t.variableDeclarator(t.identifier(injectParam), t.objectExpression([]))
                            ]));
                        }
                        if (idx === 1) {
                            injectStatements.push(t.variableDeclaration('var', [
                                t.variableDeclarator(t.identifier(injectParam), t.objectExpression([]))
                            ]));
                        }
                        if (idx === 2) {
                            injectStatements.push(t.variableDeclaration('var', [
                                t.variableDeclarator(t.identifier(injectParam), t.functionExpression(null, [], t.blockStatement([])))
    
                            ]));
                        }
                        if (idx === 3) {
                            injectStatements.push(t.variableDeclaration('var', [
                                t.variableDeclarator(t.identifier(injectParam), t.arrayExpression([]))
                            ]));
                        }
                    })
    
                    const txtModuleInitStatements = [];
                    deps.forEach((dep, idx) => {
                        if (txtDeps.indexOf(dep) > -1) {
                            const val = depsVal[idx];
                            txtModuleInitStatements.push(
                                t.expressionStatement(t.assignmentExpression('=', t.identifier(val), t.stringLiteral(''))))
                        }
                    })
    
                    const content = requires.concat(txtModuleInitStatements).concat(injectStatements).concat(cbContent).concat(exportStatement);
    
                    const rootFunc = t.expressionStatement(
                        t.callExpression(
                            t.memberExpression(
                                t.functionExpression(t.identifier('nejModule'), [], t.blockStatement(content)),
                                t.identifier('call')
                            ),
                            [t.identifier('window')]
                        )
                    )
                    path.replaceWith(rootFunc)
                    hasReturn = false;
                    randomValCount = 0;
                    txtDeps = [];
                }
            },
            ReturnStatement(path) {
                const funcParent = path.getFunctionParent();
                let funcName;
                try {
                    if (funcParent && (funcParent.node.id.name === 'nejModule' || isNejModule(funcParent.parent))) {
                        path.replaceWith(createExports(path.node.argument));
                        hasReturn = true;
                    }
                } catch (e) {
                }
            }
        }
    };
};
