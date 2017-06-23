/**
 * Created by eden_liu on 2017/6/23.
 */

var url = require('ch02/url-test');
var parsedURL = url.parse('http://www.example.com/rofile?name=barry'); // 使用url模組的parse函數

console.log(parsedURL.protocol); // "http:"
console.log(parsedURL.host); // "www.example.com"
console.log(parsedURL.query); // "name=barry"