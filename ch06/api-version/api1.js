/**
 * Created by eden_liu on 2017/7/3.
 */

const api = require('express').Router();

api.get('/timezone', (req, res) => res.send('Sample response for /timezone'));

api.get('/all_timezones', (req, res) => res.send('Sample response for /all_timezones'));

module.exports = api;