/**
 * Created by eden90267 on 2017/7/4.
 */

const path = require('path');

const app = require('express')();

// 告訴Express任何以.ejs結尾的文件都應進行渲染
app.set('view engine', 'ejs');
// 告訴Express，views文件夾的位置
app.set('views', path.resolve(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/test1', (req, res) => {
    res.render('test1', {
        name: 'Tony Hawk',
        birthyear: 1968,
        career: 'skateboarding',
        bio: '<b>Tony Hawk</b> is the coolest skateboarder around.'
    });
});

app.listen(3000);