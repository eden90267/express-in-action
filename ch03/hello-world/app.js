/**
 * Created by eden90267 on 2017/6/24.
 */

var express = require('express');
var path = require('path');
var http = require('http');

var app = express();

// 告訴Express你的視圖存在於一個名為views的文件夾中
app.set('views', path.resolve(__dirname, 'views'));
// 告訴Express你將使用EJS模板引擎
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index', {
        message: 'Hey everyone! This is my webpage.'
    });
});

http.createServer(app).listen(3000);