/**
 * Created by eden_liu on 2017/7/3.
 */

const app = require('express')();

// 引入router
const apiVersion1 = require('./api1');
const apiVersion2 = require('./api2');

// 使用router
app.use('/v1', apiVersion1);
app.use('/v2', apiVersion2);

app.listen(3000, () => console.log('App started on port 3000'));