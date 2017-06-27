/**
 * Created by eden90267 on 2017/6/27.
 */

var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.use(function (req, res, next) {
    console.log('Request IP：' + req.url);
    console.log('Request date：' + new Date());
    next(); // 這行很重要
});

app.use(function (req, res, next) {
    var filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            return next();
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath);
        } else {
            // 不存在則調用下一個中間件
            next();
        }
    });
});

app.listen(3000, function () {
    console.log('App started on port 3000');
});