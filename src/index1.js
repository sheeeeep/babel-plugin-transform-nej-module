let t;

module.exports = function (babel) {
    t = babel.types;
    return {
        visitor: {
            CallExpression(path, state) {
                const callee = path.node.callee,
                    args = path.node.arguments;
                let _callee, _arguments;

                if (!callee) return;

                if ((callee.name === 'define') || ((t.isMemberExpression(callee) ? // nej.define
                        ((callee.object.name ? callee.object.name.toLocaleLowerCase() == 'nej' : false) &&
                            callee.property.name === 'define') :
                        false
                    ))) {
                    _callee = normalizeDefine();

                    path.node.callee = _callee;
                    path.node.arguments[0] = normalizeUrl(args[0]);
                    // _arguments = [normalizeUrl(args[0]), args[1]];
                    // path.replaceWith(t.callExpression(_callee, _arguments));
                }
            }
        }
    };
};

const normalizeDefine = function () {
    return t.identifier('define');
}

const normalizeUrl = function (arg) {
    const urls = arg.elements;

    const _urls = urls.map(itm => spotBrace(spotExt(itm.value)));
    return t.arrayExpression(_urls);
}

const spotExt = function (url) {
    let [_fileExtKey, _url] = url.split('!');

    if (!_url) {
        _url = _fileExtKey;
    }
    

    return _url
}

const spotBrace = function (url) {
    let _url = url.split(''),
        [leftPos, rightPos] = [_url.indexOf('{'), _url.indexOf('}')];

    if (rightPos >= 0) {
        _url.splice(rightPos, 1);
    }
    if (leftPos >= 0) {
        _url.splice(leftPos, 1);
    }
    return t.stringLiteral(_url.join(''));
}