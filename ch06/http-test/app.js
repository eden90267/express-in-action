/**
 * Created by eden_liu on 2017/6/30.
 */

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('you just send a GET request, friend'));

app.post('/', (req, res) => res.send('a POST request? nice'));

app.put('/', (req, res) => res.send('a POST request? nice'));

app.post('/', (req, res) => res.send('a POST request? nice'));