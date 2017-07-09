const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, 'tmp/build')));

app.listen(3000, () => console.log('App started on port 3000.'));