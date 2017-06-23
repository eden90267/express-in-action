/**
 * Created by eden_liu on 2017/6/23.
 */

var fs = require('fs');
var options = {encoding: 'utf-8'};

fs.readFile('myfile.txt', options, function (err, data) {
    if (err) return console.log('Error reading file!');

    // 透過正則表達式打印X的個數
    console.log(data.match(/x/gi).length + " letter X's");
});

console.log("Hello world!");