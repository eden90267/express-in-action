/**
 * Created by eden_liu on 2017/6/23.
 */

var express = require('express'); // 引入Express並存入一個變量

var app = express(); // 調用express()並將新的Express應用程序放到變量app中

// 發送"Hello, World!"
app.get('/app', function (request, response) {
    response.send('Hello, world!');
});

// 在3000端口啟動Express服務，並打印它已經啟動
app.listen(3000, function () {
    console.log('Express ap started on port 3000.');
});