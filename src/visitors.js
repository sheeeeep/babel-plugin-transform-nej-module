const t = require("babel-types");
const { get } = require('lodash');
const buildUtil = require('./buildUtil');

const returnVisitor = {
    /* 
        return xxx;
        =>
        module.exports = xxx;
        return;
    */
    ReturnStatement(path) {
        const funcParent = path.getFunctionParent();
        const funcParentName = get(funcParent, 'node.id.name');

        if(funcParentName === 'nejModule') {
            /**
             * 不处理
             * module.exports = xxx;
             * return;
             */
            const preSibling = path.key > 0 ? path.getSibling(path.key-1).node : null; //上一条语句
            const preSiblingLeft = get(preSibling, 'expression.left.object.name') + '.' + get(preSibling, 'expression.left.property.name');
            if(preSiblingLeft === 'module.exports') {
                return;
            }
            
            let ret = path.node.argument;
            const exportStat = buildUtil.buildExport(ret);
            path.replaceWithMultiple(exportStat);
        }
    }
}

const outputResultVisitor = {
    Identifier(path) {
        const funcParent = path.getFunctionParent();
        const funcParentName = get(funcParent, 'node.id.name');
        
        // pro => exports;
        if (funcParentName === 'nejModule') {
            if (path.node.name === this.outputResult) {
                path.node.name = 'exports';
            }
        }
    },
    AssignmentExpression(path) {
        const node = path.node;
        const left = get(node, 'left.object.name') + '.' + get(node, 'left.property.name');
        const right = get(node, 'right.name');
        const operator = node.operator;

        /**
         *  module.exports = pro
         *  =>
         *  module.exports = exports;
         */
        if (left === 'module.exports' && operator === '=' && right === this.outputResult) {
            right = 'exports';
        }
    }
}

module.exports = {
    returnVisitor, outputResultVisitor
}