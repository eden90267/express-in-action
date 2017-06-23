/**
 * Created by eden_liu on 2017/6/23.
 */

var MAX = 100;

function randomInteger() {
    return Math.floor(Math.random() * MAX);
}

module.exports = randomInteger; // 公開模塊給其他文件