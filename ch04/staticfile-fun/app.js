/**
 * Created by eden90267 on 2017/6/27.
 */

var express = require('express');
var path = require('path');
var fs = require('fs');

var morgan = require('morgan');

var app = express();

app.use(morgan('short'));

var staticPath = path.join(__dirname, 'static');
app.use(express.static(staticPath)); // 使用express.static從靜態路徑提供服務

// 我們去掉了參數next，因為你用不到它
app.use(function (req, res) {
    // 設置狀態碼為404
    res.status(404);
    // 發送錯誤提示
    res.send('File not found!');
});

app.listen(3000, function () {
    console.log('App started on port 3000');
});