/**
 * Created by eden_liu on 2017/6/23.
 */

var Mustache = require('mustache');

var result = Mustache.render('Hi, {{first}} {{last}}', {
    first: 'Nicolas',
    last: 'Cage'
});

console.log(result);