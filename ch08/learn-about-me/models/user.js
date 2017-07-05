const mongoose = require('mongoose');
let userSchema = mongoose.Schema({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    createdAt: {type: Date, default: Date.now},
    displayName: String,
    bio: String
});
userSchema.methods.name = () => {
    return this.displayName || this.username;
};