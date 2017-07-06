const mongoose = require('mongoose');

const bcrypt = require('bcrypt-nodejs');
const SALT_FACTOR = 10;

let userSchema = mongoose.Schema({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    createdAt: {type: Date, default: Date.now},
    displayName: String,
    bio: String
});

userSchema.methods.name = function() {
    return this.displayName || this.username;
};

// 一個用於提供給用戶bcrypt的模組空函數
const noop = function () {
};

// 定義一在模型保存前運行的函數
userSchema.pre('save', function (done) {
    // 儲存當前用戶的引用
    var user = this;
    // 如果密碼沒有被修改過的話跳過處理邏輯
    if (!user.isModified('password')) {
        return done();
    }
    // 根據salt生成對應的散列，一旦完成則調用內部函數
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return done(err);
        bcrypt.hash(user.password, salt, noop,
            // 散列化用戶的密碼
            function (err, hashedPassword) {
                if (err) return done(err);
                // 儲存密碼並繼續進行保存
                user.password = hashedPassword;
                done();
            }
        );
    });
});

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

let User = mongoose.model('User', userSchema);
module.exports = User;