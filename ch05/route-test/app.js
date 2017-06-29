
const express = require('express');
const path = require('path');

const apiRouter = require('./routes/api_router');

const app = express();

const STATIC_PATH = path.resolve(__dirname, "static");
app.use(express.static(STATIC_PATH));

// 使用你自己的Router
app.use('/api', apiRouter);

app.listen(3000);