# chap07. 視圖與模板：Pug和EJS

從這章開始，你將不再繼續學習Express相關的知識。

視圖：它可以給你提供便利的方式來動態生成內容(通常是HTML)。你之前見過了一視圖引擎：EJS幫助你向HTML注入特殊變量。

## Express視圖特性

視圖引擎(view engine)。“實際渲染視圖的模組”。Pug和EJS都是視圖引擎，而且還有很多其他的視圖引擎。

Express並不限制你需要使用哪種引擎。只要Express能夠接受**視圖引擎暴露的API**，那麼你就可以使用這個引擎。Express提供了一個便捷函數來幫助你渲染視圖：

### 一個簡單的視圖渲染示例

```
const path = require('path');

const app = require('express')();

// 告訴Express任何以.ejs結尾的文件都應進行渲染
app.set('view engine', 'ejs');
// 告訴Express，views文件夾的位置
app.set('views', path.resolve(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

一旦你`npm i --save ejs`，它就可以正常工作了。當你訪問根目錄，Express將會尋找views/index.ejs然後利用EJS對它進行渲染。

### 複雜的視圖渲染

使用兩種視圖引擎做為響應(瘋狂)：

```

const path = require('path');
const ejs = require('ejs');

var app = require('express')();

app.locals.appName = 'Song Lyrics';

app.set('view engine', 'jade');
app.set('view', path.resolve(__dirname, 'views'));
app.engine('html', ejs.renderFile);

app.use((req, res, next) => {
    res.locals.userAgent = req.headers['user-agent'];
    next();
});

app.get('/about', (req, res) => {
    res.render('about', {
        currentUser: 'india-arie123'
    });
});

app.get('/contact', (req, res) => res.render('contact.ejs'));

app.use((req, res) => {
    res.status(404).render('404.html', {
        urlAttempted: req.url
    });
});

app.listen(3000);
```

以下三種情況調用render會發生下面的事情：

1. Express在你每次調用render的時候會創建上下文對象。這些上下文對象會在渲染的時候傳入視圖引擎。它們讓變數在視圖中有效。

    首先在app.locals上添加所有屬性