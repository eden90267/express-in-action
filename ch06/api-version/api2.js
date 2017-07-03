/**
 * Created by eden_liu on 2017/7/3.
 */

const api = require('express').Router();

api.get('/timezone', (req, res) => res.send('API 2: super cool new response for /timezone'));

module.exports = api;