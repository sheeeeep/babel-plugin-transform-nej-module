let t;
let path, state;

module.exports = function (babel) {
    t = babel.types;
    return {
        visitor: {
            CallExpression(_path, _state) {
                path = _path;
                state = _state;
                const callee = path.node.callee,
                    args = path.node.arguments;
                let _callee, _arguments;

                state.opts = {
                    mode: 'web'
                }

                if (!callee) return;

                if ((callee.name === 'define') || ((t.isMemberExpression(callee) ? // nej.define
                        ((callee.object.name ? callee.object.name.toLocaleLowerCase() == 'nej' : false) &&
                            callee.property.name === 'define') :
                        false
                    ))) {

                    path.node.callee = normalizeDefine();

                    path.node.arguments[0] = normalizeUrls(path.node.arguments[0]);
                    if (path.node.arguments[1]) {
                        normalizeCb(path.node.arguments[1]);
                    }
                }
            }
        }
    };
};

const normalizeDefine = function () {
    return t.identifier('define');
}

const normalizeUrls = function (target) {
    if (t.isArrayExpression(target)) {
        return normalizeUrl(target.elements);
    }

    if (t.isStringLiteral(target)) {
        return normalizeUrl([target]);
    }

    if (t.isFunctionExpression(target)) {
        normalizeCb(target);
        return target;
    }

    if (t.isIdentifier(target)) {
        //target = normalizeUrls(getVal(target));
    }

    return target;
}

const normalizeCb = function (target) {
    const _path = `arguments.${path.node.arguments.length-1}.body`;

    if (t.isIdentifier(target)) {
        //target = normalizeCb(getVal(target));
    } else {
        path.get(_path).unshiftContainer('body', injectParams());
    }

}

const normalizeUrl = function (urls) {
    const _urls = urls.map(itm => spotAlias(itm.value || itm));
    return t.arrayExpression(_urls);
}

const spotAlias = function (url) {
    let _url = spotExt(url);
    _url = spotPlatform(_url);
    _url = spotBraceKey(_url);
    _url = spotBrace(_url);

    return _url;
}

const spotExt = function (url) {
    let [_fileExtKey, _url] = url.split('!');

    if (!_url) {
        _url = _fileExtKey;
    }

    return _url;
}

const spotPlatform = function (url) {
    let _url = url.split(''),
        [leftPos, rightPos] = [_url.indexOf('{'), _url.indexOf('}')];

    if (leftPos >= 0 && rightPos >= 0) {
        const key = _url.slice(leftPos + 1, rightPos).join('');

        if (key === 'platform') {
            _url.unshift('./');
        }
    }

    return _url.join('');
}

const spotBraceKey = function (url) {
    let _url = url.split(''),
        [leftPos, rightPos] = [_url.indexOf('{'), _url.indexOf('}')];

    if (leftPos >= 0 && rightPos >= 0) {
        const _key = _url.slice(leftPos + 1, rightPos).join(''),
            _val = state.opts[_key] || _key;

        url.replace(_key, _val);
    }

    return url;
}

const spotBrace = function (url) {
    let _url = url.split(''),
        [leftPos, rightPos] = [_url.indexOf('{'), _url.indexOf('}')];

    if (rightPos >= 0) {
        if (_url[rightPos + 1] !== '/') {
            _url.splice(rightPos, 1, '/');
        } else {
            _url.splice(rightPos, 1);
        }
    }
    if (leftPos >= 0) {
        _url.splice(leftPos, 1);

    }
    return t.stringLiteral(_url.join(''));
}

const injectParams = function () {
    let p = generateParam(t.identifier('p'), t.identifier('window')),
        o = generateParam(t.identifier('o'), t.objectExpression([])),
        f = generateParam(t.identifier('f'), t.functionExpression(null, [], t.blockStatement([t.returnStatement(t.numericLiteral(-1))]))),
        r = generateParam(t.identifier('r'), t.arrayExpression([]));
    return [p, o, f, r];
}

const generateParam = function (name, value) {
    return t.variableDeclaration('let', [
        t.variableDeclarator(name, value)
    ])
}