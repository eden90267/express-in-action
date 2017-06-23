/**
 * Created by eden_liu on 2017/6/23.
 */

var Mustache = require('mustache');

Mustache.render('Hello, {{first}} {{last}}!', {
    first: 'Nicolas',
    last: 'Cage'
});

Mustache.render('Hello, {{first}} {{last}}', {
    first: 'Sheryl',
    last: 'Sandberg'
});