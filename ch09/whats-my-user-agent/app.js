/**
 * Created by eden90267 on 2017/7/8.
 */

const app = require('express')();
const path = require('path');

app.set('port', process.env.PORT || 3000);

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    let userAgent = req.headers['user-agent'] || 'none';

    if (req.accepts('html')) {
        // 如果請求接受HTML，則渲染index模板
        res.render('index', {userAgent});
    } else {
        res.type("text");
        res.send(req.headers["user-agent"]);
    }
});

app.listen(app.get('port'), () =>
    console.log(`App started on port ${app.get("port")}`));

module.exports = app;