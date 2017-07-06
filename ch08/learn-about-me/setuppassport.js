const passport = require('passport');
const User = require('./models/user');


module.exports = () => {

    // serializeUser可以將一個user對象轉換為ID。
    // 不傳入錯誤，並傳入一個user對象調用done
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // deserializeUser可以將用戶ID轉換為user對象。
    // 一旦完成轉換，你需要傳入錯誤和用戶對象來調用done
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    const LocalStrategy = require('passport-local').Strategy;

    // 告訴Passport使用本地策略
    passport.use('login', new LocalStrategy((username, password, done) => {
        User.findOne({username}, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, {message: 'No user has that username!'});

            user.checkPassword(password, (err, isMatch) => {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password.'});
                }
            });
        });
    }));

};