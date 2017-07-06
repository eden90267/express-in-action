/**
 * Created by eden_liu on 2017/7/6.
 */

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

// 把你的路由放到另一個文件
const routes = require('./routes');

const app = express();

mongoose.connect(require('./credentials').mongo.connectionString);

app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 使用四個中間件
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(routes);

app.listen(app.get("port"), () => {
    console.log('Server started on port ' + app.get('port'));
});