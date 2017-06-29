/**
 * Created by eden_liu on 2017/6/29.
 */

const express = require('express');
const path = require('path');
const http = require('http');

const app = express();

const PUBLISH_PATH = path.resolve(__dirname, 'public');
const USER_UPLOAD_PATH = path.resolve(__dirname, 'user_uploads');

app.use('/public', express.static(PUBLISH_PATH));
app.use('/uploads', express.static(USER_UPLOAD_PATH));

app.use((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Looks like you didn't find a static file.");
});

http.createServer(app).listen(3000);