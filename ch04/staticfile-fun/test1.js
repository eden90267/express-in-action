/**
 * Created by eden_liu on 2017/6/28.
 */

const express = require('express');
const path = require('path');

const app = express();

const filePath = path.join(__dirname, 'celine.jpg');
app.use((req, res, next) => {
    res.sendFile(filePath, (err) => {
        if (err) {
            next(new Error('Error sending file!'));
        }
    });
});

// 記錄所有錯誤的中間件
app.use((err, req, res, next) => {
    console.error(err);
    next(err);
});

// 相應錯誤
app.use((err, req, res, next) => { // 確保你指定了四個參數
    res.status(500);
    res.send('Internal server error.');
});

app.listen(3000, () => {
    console.log('App started on port 3000');
});