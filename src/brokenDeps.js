
const TEMPLATE = require('./TEMPLATE');
const buildUtil = require('./buildUtil');
const t = require('babel-types');

const normalizeDeps = function (nejDeps, opts) {
    const deps = Object.keys(nejDeps);
    const requires = {};
    const txtModuleParam = [];

    function dropPrefix(dep, nejDep) {
        const [prefix, rawDep] = dep.split('!');

        if (prefix === 'css') {
            txtModuleParam.push(nejDeps[nejDep]);
        }

        if (prefix === 'text' && rawDep.indexOf('.css') > -1) {
            txtModuleParam.push(nejDeps[nejDep]);
        }

        dep = rawDep ? rawDep : prefix;

        return dep;
    }
    function dropJSExt(dep) {
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

    deps.forEach(dep => {
        const nejDep = dep;

        dep = dropPrefix(dep, nejDep);
        dep = dropJSExt(dep);
        dep = assignMode(dep);
        dep = processPlatform(dep);
        dep = dropBracket(dep);

        requires[dep] = nejDeps[nejDep];
    });

    return {
        requires,
        txtModuleParam
    }

}

module.exports = function (deps, depsVal, opts) {
    const nejDeps = {};
    deps.forEach((dep, idx) => {
        nejDeps[dep] = depsVal[idx] || `randomVal${idx}`;
    });

    const { txtModuleParam, requires } = normalizeDeps(nejDeps, opts); //json、text、css方式引入的依赖，都按照nej的模式处理为空字符串

    const injectParams = depsVal.splice(deps.length);
    // let outputResultExportStat = [];
    let injectParamStats = [], outputResult;
    if (injectParams.length) {
        outputResult = injectParams[0];
        // outputResultExportStat = buildUtil.buildExport(outputResult);
        injectParamStats = buildUtil.buildInjectParams(injectParams);
    }


    const txtModuleInitStats = buildUtil.buildEmptyStrings(txtModuleParam);
    const requireStats = buildUtil.buildRequires(requires);

    return { requireStats, txtModuleInitStats, injectParamStats, outputResult };
}