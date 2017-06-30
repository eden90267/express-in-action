/**
 * Created by eden_liu on 2017/6/30.
 */

const express = require('express');

const app = express();

app.get('/random/:min/:max', (req, res) => {
    let min = parseInt(req.params.min, 10);
    let max = parseInt(req.params.max, 10);

    if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({error: 'Bad request'});
    }

    let result = Math.round((Math.random() * (max - min)) + min);

    res.json({result: result});
});

app.listen(3000, () => console.log('App started on port 3000'));