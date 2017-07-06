/**
 * Created by eden_liu on 2017/7/6.
 */

const express = require('express');

const User = require('./models/user');

const router = express.Router();

router.use((req, res, next) => {
    // 為你的模板設置幾個有用的變數
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});

router.get('/', (req, res, next) => {
    // 查詢用戶集合，並且總是先返回新的用戶
    User.find()
        .sort({createdAt: 'descending'})
        .exec((err, users) => {
            if (err) return next(err);
            res.render('index', {users: users});
        });
});

module.exports = router;