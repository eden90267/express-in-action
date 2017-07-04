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
app.set('views', path.resolve(__dirname, 'views'));
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

1. Express在你每次調用render的時候會創建**上下文對象**。這些上下文對象會在渲染的時候傳入視圖引擎。**它們讓變數在視圖中有效**。

    首先在app.locals上添加所有屬性，它是一個所有請求都能獲取的對象。然後給res.locals添加所有的屬性，它重寫app.locals已經存在的屬性。最後，添加渲染時傳遞的對象的屬性(再次覆蓋之前已經添加過的屬性)。一切結束後，如果你訪問*/about*，擬將創建一個上下文對象，這個對象會攜帶三個屬性：appName、userAgent，以及currentUser。如果訪問*/contact*，只會有appName和userAgent在上下文中；404處理將會有appName，userAgent，以及urlAttempted。

2. 你將決定是否啟用視圖緩存。視圖緩存會以為是整個視圖渲染緩存，但不是這樣；Express只緩存**視圖文件的查找**以及**分配適當的視圖引擎**。它並不會緩存真實渲染出來的視圖。

    有兩種方式來決定是否啟用視圖引擎，其中只有一種是文檔紀錄。

    - 文檔記錄方式──有一個參數你可在app中設置。`app.enabled('view cache')`為真，Express將會緩存視圖的查找。缺省狀態下，它會在開發模式下被禁用，並且在啟用在生成環境中。但你可透過`app.enable('view cache')`或`app.disable('view cache')`來進行改變。
    - 非文檔記錄方式──如果在前面的步驟產生了攜帶真實屬性cache的上下文對象，然後緩存將會在視圖中開啟。它重寫了所有的應用程序設置。允許你基於view-by-view緩存，但是我認為最需要知道的事情就是你要知道有這麼個東西存在，這樣你就可避免無意做這件事了。

3. 你尋找視圖文件存在的位置以及要使用什麼視圖。在這例子中，你想要將about變成*/path/to/my/app/views/about.jade* + Pug以及contact.ejs變成*/path/to/my/app/views/contact.ejs* + EJS。404處理會透過你之前調用的`app.engine`，將EJS關連到404.html。如果你已經啟用了文件查找和視圖類型緩存，你將跳到緩存的最後一步。如果不是，請繼續。
4. 如果你沒有提供一個文件擴展，Express會追加你指定的默認擴展名。在這例子中，"about"會變成about.jade，但是contact.ejs和404.html將會保持原樣。如果你沒有提供擴展而且也沒有默認的視圖引擎，Express將會拋出一個錯誤。否則，它將繼續。
5. Express查看你的文件後綴來決定使用什麼引擎。如果它匹配到任何你已經指定過的引擎，它就會使用這個引擎。在這例子中，about.jade會使用Pug引擎，因為它是缺省的。contact.ejs將會嘗試根據文件擴展名require('ejs')。你明確的指定了404.html使用EJS的`renderFile`函數，所以他會使用這個函數。
6. Express在你的視圖文件夾中尋找文件。如果它沒有找到文件，那麼就會拋出一個錯誤，但是如果找到了文件它就會繼續到後續工作。
7. 如果需要的話，Express可以緩存所有的查找邏輯。如果已經開啟了視圖緩存，你將在下次緩存所有的查找邏輯。
8. 在渲染視圖的時候，將會透過Express中的一行代碼調用視圖引擎。這裡會接管視圖引擎並且產生真實的HTML。

這有點麻煩，但是99%的情況下都會選好一個視圖引擎並且一直使用它，所以你可能會免受這種複雜情況的困擾。