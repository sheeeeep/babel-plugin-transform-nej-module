let t;
let options = {};
let fileExt = {
    'text': '',
    'default': '.js'
}

module.exports = function (babel) {
    t = babel.types;
    return {
        visitor: {
            CallExpression(path, state) {
                const callee = path.node.callee,
                        args = path.node.arguments;
                let _callee, _arguments;
                options = state.opts || options;

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

    const _urls = urls.map(itm => spotAlias(itm.value))
    return t.arrayExpression(_urls);
}

const spotAlias = function (url) {
    let [_fileExtKey, _url] = url.split('!');

    if (!_url) {
        _url = _fileExtKey;
        _fileExtKey = 'default';
    }
    _url = _url.split('/');

    for (let key in options) {
        _url = _url.map(itm => {
            if (itm === key) {
                return options[key];
            } else {
                return itm;
            }
        });
    };

    return t.stringLiteral(_url.join('/') + fileExt[_fileExtKey]);
}