/**
 * Created by eden_liu on 2017/6/29.
 */

const express = require('express');

const ALLOWED_IPS = [
    "127.0.0.1",
    "123.456.7.89"
];

const api = express.Router();

api.use((req, res, next) => {
    let userIsAllowed = ALLOWED_IPS.indexOf(req.ip) !== -1;
    if (userIsAllowed) {
        res.status(401).send('Not authorized!');
    } else {
        next();
    }
});

api.get('/users', (req, res) => {
    /* ... */
});
api.post('/users', (req, res) => {
    /* ... */
});

api.get('/messages', (req, res) => {
    /* ... */
});
api.post('/messages', (req, res) => {
    /* ... */
});

module.exports = api;