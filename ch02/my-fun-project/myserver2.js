/**
 * Created by eden90267 on 2017/6/23.
 */

var http = require('http');

// 透過一個請求處理函數解析請求URL
function requestHandler(req, res) {
    if (req.url === '/') {
        res.end('Welcome to the homepage!');
    } else if (req.url === '/about') {
        res.end('Welcome to the about page!');
    } else {
        res.end('Error! File not found');
    }
}

var server = http.createServer(requestHandler); // 創建一個server，並用你的函數去處理請求

server.listen(3000); // 啟動server並監聽3000端口