
NEJ.define(['a', 'b', 'c'], function() {
    console.log('hello');
})

NEJ.define([], function() {
    console.log('hello');
})

NEJ.define(['a', 'b', 'c'], function(a, b, c, d) {
    console.log('hello');
})

NEJ.define(function() {
    console.log('hello');
})

NEJ.define(function(a,b,c,d) {
    console.log('hello');
})