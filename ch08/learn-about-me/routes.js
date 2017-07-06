/**
 * Created by eden_liu on 2017/7/6.
 */

const express = require('express');
const passport = require('passport');

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

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup',
    (req, res, next) => {
        // body-parser把username和password添加到了req.body
        let username = req.body.username;
        let password = req.body.password;

        // 調用findOne只返回一個用戶。你想在這批配一個用戶名
        User.findOne({username: username}, (err, user) => {
            if (err) return next(err);
            // 如果你找到一個用戶，你需要保證他的用戶名必須已經存在
            if (user) {
                req.flash('error', 'User already exists');
                return res.redirect('/signup');
            }
            // 透過username和password創建一個User模型的實例
            let newUser = new User({
                username,
                password
            });
            // 將新的用戶保存到資料庫中，然後繼續到下一個請求處理
            newUser.save(next);
        });
    },
    // 用戶有效性驗證
    passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

router.get('/users/:username', (req, res, next) => {
    User.findOne({username: req.params.username}, (err, user) => {
        if (err) return next(err);
        if (!user) return next(404);
        res.render('profile', {user: user});
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    // 如果登入失敗則透過connect-flash設置錯誤訊息
    failureFlash: true,
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    // 一個Passport提供的函數
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('info', 'You must be logged in to see this page.')
        res.redirect('/login');
    }
}

router.get('/edit', ensureAuthenticated, (req, res) => {
    res.render('edit');
});

router.post('/edit', ensureAuthenticated, (req, res, next) => {
    req.user.displayName = req.body.displayName;
    req.user.bio = req.body.bio;
    req.user.save((err) => {
        if (err) return next(err);
        req.flash('info', 'Profile updated!');
        res.redirect('/edit');
    });
});

module.exports = router;