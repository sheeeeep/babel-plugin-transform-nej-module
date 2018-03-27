let t;

module.exports = function (babel) {
    t = babel.types;

    const isNejModule = function isNejModule() {

    }

    const disassembleNejModule = function disassembleNejModule(nejModule) {

    }

    const create = {
        /**
         * 转换nej的依赖为require
         */
        requireStmts: function requireStmts() {

        },
        /**
         * 文本模块（css!,json!）引入后均初始化为''
         */
        txtModuleInitStmts: function txtModuleInitStmts() {

        },
        /**
         * 后三个注入参数为空对象、空函数、空数组
         */
        emptyStmts: function emptyStmts() {

        },
        /**
         * 将return或输出结果集空间转换为module.exports，同时存在时
         */
        exportStmt: function exportStmt() {

        }
    }



    return {
        visitor: {
            CallExpression(path) {
                const nejModule = path.node;

                if (!isNejModule(nejModule)) {
                    return;
                }

                const { deps, exportParam, emptyParams, cbStmts, returnParam } = disassembleNejModule(nejModule);

                const requireStmts = create.requireStmts(deps)
                const txtModuleInitStmts = create.txtModuleInitStmts(deps);
                const emptyStmts = create.emptyStmts(emptyParams);
                const exportStmt = create.exportStmt(returnParam, exportParam);

                const statements = []
                    .concat(requireStmts)
                    .concat(txtModuleInitStmts)
                    .concat(emptyStmts)
                    .concat(cbStmts)
                    .concat(exportStmt);

                const IEFF = createIEFF(statements);
                path.replaceWith(IEFF)
            }
        }
    };
};
