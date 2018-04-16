'use strict';

const assertTransform = require('assert-transform');
const babel = require('babel-core');
const path = require('path');
const assert = require('assert');

const getBabelOps = pluginOps => {
    return {
        presets: [],
        plugins: [[path.resolve(__dirname, '../src/index.js'), pluginOps]]
    };
};

const babelOps = getBabelOps({ mode: 'wap' });

describe('module test', () => {
    it('test nej.define', () => {
        return assertTransform(
            path.join(__dirname, './module/nejDefine.actual.js'),
            path.join(__dirname, './module/nejDefine.expected.js'),
            babelOps
        );
    });

    it('test define', () => {
        return assertTransform(
            path.join(__dirname, './module/define.actual.js'),
            path.join(__dirname, './module/define.expected.js'),
            babelOps
        );
    });

    it('test fault nej module', () => {
        return assertTransform(
            path.join(__dirname, './module/faultModule.actual.js'),
            path.join(__dirname, './module/faultModule.expected.js'),
            babelOps
        );
    });
});

describe('deps test', () => {
    it('test nej module without deps', () => {
        return assertTransform(
            path.join(__dirname, './deps/withoutDeps.actual.js'),
            path.join(__dirname, './deps/withoutDeps.expected.js'),
            babelOps
        );
    });

    it('test nej module with empty deps', () => {
        return assertTransform(
            path.join(__dirname, './deps/emptyDeps.actual.js'),
            path.join(__dirname, './deps/emptyDeps.expected.js'),
            babelOps
        );
    });

    it('test deps with prefix', () => {
        return assertTransform(
            path.join(__dirname, './deps/prefix.actual.js'),
            path.join(__dirname, './deps/prefix.expected.js'),
            babelOps
        );
    });

    // it('test deps with injected param', () => {
    //     return assertTransform(
    //         path.join(__dirname, './deps/injectedParam.actual.js'),
    //         path.join(__dirname, './deps/injectedParam.expected.js'),
    //         babelOps
    //     );
    // });

    // it('test deps with output result space', () => {
    //     return assertTransform(
    //         path.join(__dirname, './deps/outputResultSpace.actual.js'),
    //         path.join(__dirname, './deps/outputResultSpace.expected.js'),
    //         babelOps
    //     );
    // });

    // it('test deps with mode', () => {
    //     return assertTransform(
    //         path.join(__dirname, './deps/mode.actual.js'),
    //         path.join(__dirname, './deps/mode.expected.js'),
    //         babelOps
    //     );
    // });

    // it('test deps with brace', () => {
    //     return assertTransform(
    //         path.join(__dirname, './module/brace.actual.js'),
    //         path.join(__dirname, './module/brace.expected.js'),
    //         babelOps
    //     );
    // });
})
