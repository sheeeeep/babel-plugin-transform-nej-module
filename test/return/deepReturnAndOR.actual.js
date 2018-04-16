define([], function(pro) {
    var flag = true;

    function temp() {
        return pro;
    }

    pro.xxx = 'aaa';

    pro.name = function() {
        console.log('hello' + pro.xxx);
    }

    if(flag) {
        return pro;
    }

    return xxx;
});