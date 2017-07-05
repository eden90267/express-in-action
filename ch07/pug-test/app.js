/**
 * Created by eden90267 on 2017/7/5.
 */

const app = require('express')();

app.set('view engine', 'pug');
app.set('views', require('path').resolve(__dirname, 'views'));

app.get('/hello-world', (req, res) => res.render('hello-world'));

app.listen(3000);