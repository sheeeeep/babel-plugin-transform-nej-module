var f;

define([], f)

f = function() {
    define([], function() {
        console.log('cb');
    });
};
