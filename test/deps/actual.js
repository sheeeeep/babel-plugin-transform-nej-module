define(function() {
    console.log(hello);
});

define([], function() {
    console.log(hello);
});

define([
    'text!./style1.css',
    'css!style2.css',
    'text!index.html'
], function(a1, a2, a3) {
    console.log(hello);
});

define([
    'text!./style1.css',
    'css!style2.css',
    'text!index.html'
], function(a1, a2, a3, pro, o, f, r) {
    console.log(hello);
});

define([
    'text!./style1.css',
    'css!style2.css',
    'text!index.html'
], function(a1, a2, a3, exports, o, f, r) {
    console.log(hello);
});
