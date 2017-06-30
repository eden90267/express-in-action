/**
 * Created by eden_liu on 2017/6/30.
 */

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('you just send a GET request, friend'));

app.post('/', (req, res) => res.send('a POST request? nice'));

app.put('/', (req, res) => res.send("i don't see a lot of PUT requests anymore"));

app.delete('/', (req, res) => res.send('oh my, a DELETE??'));

app.listen(3000, () => console.log('App is listening on port 3000'));