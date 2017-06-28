const express = require('express');

const app = express();

app.get('/olivia', (req, res) => res.send(`Welcome to Olivia's homepage!`));

// 匹配傳入的請求，如：/users/123，/users/horse_ebooks
app.get('/users/:userid', (req, res) => {
    // 將userId轉換為整數
    let userId = parseInt(req.params.userid, 10);
    // ...
});

app.use((req, res) => res.status(404).send('Page not found!'));

app.listen(3000);