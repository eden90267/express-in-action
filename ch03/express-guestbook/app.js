/**
 * Created by eden90267 on 2017/6/24.
 */

var http = require('http');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

// 第一行告訴Express視圖存在一個views文件中
// 下一行表明視圖將使用EJS引擎
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', "ejs");

// 創建一個global的陣列用於儲存所有的條目
var entries = [];
// 使這個條目陣列可以在所有視圖中訪問
app.locals.entries = entries;

// 使用Morgan來記錄每次request請求
app.use(logger('dev'));

// 填充一個req.body變數如果用戶提交表單的話(擴展項是必須的)
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/new-entry', function (req, res) {
    res.render('new-entry');
});

app.post('/new-entry', function (req, res) {
    if (!req.body.title || !req.body.body) {
        res.status(400).send('Entries must have a title and a body.');
        return;
    }
    console.log(req.body);
    entries.push({
        title: req.body.title,
        body: req.body.body,
        published: new Date()
    });
    res.redirect('/');
});

app.use(function (req, res) {
    res.status(404).render('404');
});

http.createServer(app).listen(3000, function () {
    console.log('Guestbook app started on port 3000.');
});
