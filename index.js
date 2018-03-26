let t;

module.exports = function (babel) {
    t = babel.types;
    var randomValCount = 0;


    const getParamFromCallBack = function getParamFromCallBack(callback) {
        let depsVal = [], cbContent = [];
        if (!t.isFunctionExpression(callback)) {
            return {
                depsVal, cbContent
            }
        }

        depsVal = callback.params.map(param => {
            return param.name;
        });

        cbContent = callback.body.body;

        return { depsVal, cbContent };
    }

    const normalizeDep = function normalizeDep(dep) {

        function dropPrefix(dep) {
            dep = dep.split('!')[1] ? dep.split('!')[1] : dep;
            return dep;
        }
        function dropJSExt() {
            const [fileName, fileExt] = dep.split('/').reverse()[0].split('.');

            if (fileExt === 'js') {
                dep = dep.replace('.js', '');
            }
            return dep;
        }

        function dropBracket() {
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
        dep = dropBracket(dep);

        return dep;
    }

    const createRequire = function createRequire(val, dep) {
        dep = normalizeDep(dep);

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

    const createExports = function createExports(exportName) {
        return t.expressionStatement(t.assignmentExpression(
            '=',
            t.memberExpression(
                t.identifier('module'),
                t.identifier('exports')
            ),
            t.identifier(exportName)
        ));
    }

    const isNejModule = function isNejModule(callee) {
        function isDefine(callee) {
            return callee.name !== 'define';
        }

        function isNejDefine(callee) {
            return !t.isMemberExpression(callee) ||
                (callee.object && callee.object.name && callee.object.name.toLowerCase() !== 'nej') ||
                (callee.property && callee.property.name !== 'define')
        }

        return isDefine(callee) && isNejDefine(callee);
    }

    return {
        visitor: {
            CallExpression(path) {
                const mainContent = path.node;
                const callee = mainContent.callee,
                    args = mainContent.arguments;

                if (!callee) {
                    return;
                }

                if (isNejModule(callee)) {
                    return;
                }

                const callback = args[1];
                const deps = args[0].elements.map(element => {
                    return element.value;
                });
                const { depsVal, cbContent } = getParamFromCallBack(callback);

                const requires = deps.map((dep, idx) => {
                    return createRequire(depsVal[idx], dep); // var depsVal[idx] = require('dep');
                })

                const injectStatements = [];
                let exportStatement = [];
                const injectParams = depsVal.splice(requires.length);
                injectParams.forEach((injectParam, idx) => {
                    if (idx === 0) {
                        exportStatement = createExports(injectParam)
                    }
                    if (idx === 1) {
                        injectStatements.push(t.variableDeclaration('var', [
                            t.variableDeclarator(t.identifier(injectParam), t.objectExpression([]))
                        ]));
                    }
                    if (idx === 2) {
                        injectStatements.push(t.variableDeclaration('var', [
                            t.variableDeclarator(t.identifier(injectParam), t.arrayExpression([]))
                        ]));
                    }
                    if (idx === 3) {
                        injectStatements.push(t.variableDeclaration('var', [
                            t.variableDeclarator(t.identifier(injectParam), t.functionExpression(null, [], t.blockStatement([])))
                        ]));
                    }
                })

                const content = requires.concat(injectStatements).concat(cbContent).concat(exportStatement);
                path.replaceWithMultiple(content)
            },
            ReturnStatement(path) {
                path.replaceWith(createExports(path.node.argument.name));
            },
            ThisExpression(path) {
                path.replaceWith(t.identifier('window'));
            }
        }
    };
};
