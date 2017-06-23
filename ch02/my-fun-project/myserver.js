/**
 * Created by eden90267 on 2017/6/23.
 */

var http = require('http');

// 定義一個函數用來處理即將到來的HTTP請求
function requestHandler(req, res) {
    console.log('In comes a request to: ' + req.url);
    res.end('Hello, world!');
}

var server = http.createServer(requestHandler); // 創建一個server，並用你的函數去處理請求

server.listen(3000); // 啟動server並監聽3000端口