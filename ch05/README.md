# chap05. 路由

## 什麼是路由?

如果你用瀏覽器訪問example.com/olivia，原生HTTP請求的第一部分大概是這樣：

```
GET /olivia http/1.1
```

HTTP請求有一個動詞(GET)，一個URL(/olivia)，以及一個HTTP版本(1.1)。當你進行路由操作的時候，你利用動詞和URL這對組合來映射到請求處理。

## 路由的一個簡單示例

```
const express = require('express');

const app = express();

app.get('/olivia', (req, res) => res.send(`Welcome to Olivia's homepage!`));

app.use((req, res) => res.status(404).send('Page not found!'));

app.listen(3000);
```

再來看看更複雜的一些路由特性

## 路由的特性

>**注意**
>其他一些框架(例如：Ruby的Rail)擁有一個中央路由文件，所有其他的路由都將在這裡被定義。Express並沒有採用這種方式──路由可以定義在很多地方。

### 捕獲路由參數

`user/1`、`user/2`，可定義一個路由並讓所有人使用它。

#### 最簡單的辦法

在路由中獲取參數最簡單的辦法就是在參數前面加上冒號。如果要獲取變量，變量存在於params之中，而params又是request的一個屬性，看到下一個代碼清單：

```
// 匹配傳入的請求，如：/users/123，/users/horse_ebooks
app.get('/users/:userid', (req, res) => {
    // 將userId轉換為整數
    let userId = parseInt(req.params.userid, 10);
    // ...
});
```
