/**
 * Created by eden90267 on 2017/7/4.
 */

const engines = require('consolidate');
const path = require('path');

const app = require('express')();

// 指定.wal文件作為你的文件後綴
app.set('view engine', 'wal');
// 將.wal文件綁定Walrus視圖引擎
app.engine('wal', engines.walrus);
// 指定你的視圖目錄
app.set('views', path.resolve(__dirname, 'views'));

// 渲染views/index.wal
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);