const express = require('express');
const assets = require('connect-assets');

const app = express();

app.use(assets({
    helperContext: app.locals,
    // 指定你使用的資源路徑。順序很重要——如果main.js存在於多個目錄中，只有第一個目錄中的會變編譯
    paths: ['assets/css', 'assets/js']
}));