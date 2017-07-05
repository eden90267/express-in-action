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

>**渲染非HTML視圖**
>
>Express的默認內容類型是HTML，如果你沒有做任何別的事情，res.render將渲染你的響應，然後把它們作為HTML發送給客戶端。大多數情況下，我覺得已經足夠。但它並不一定會是這種形式。你可以渲染純文本、XML、JSON，或者任何你需要的。只要透過改變參數res.type的內容類型就可以了：
>
>```
>app.get('/', (req, res) => {
>  res.type('text');
>  res.render('myview', {
>    currentUser: 'Gilligan',
>  });
>});
>```
>
>有更加好的方式來渲染這些東西──res.json，例如，應該用來替代視圖渲染JSON──但這也是另一個實現方式。

### 讓所有的視圖都能兼容Express：Consolidate.js

有大量的視圖可做選擇。Mustache、Handlebars，或者Underscore.js的模板。你可能還想使用那些，移植到Node的諸如Jinja2或者HAML，這樣別的編程語言的模板。

EJS和Pug這樣的視圖引擎，能在Express中工作良好。其他視圖引擎並沒有適配Express API，它們需要包裏一些代碼，從而使得Express能夠理解它們。

進入Consolidate.js([https://github.com/tj/consolidate.js](https://github.com/tj/consolidate.js))，一個能夠包裝大量視圖引擎來適配Express的庫。它支持經典的EJS、Pug、Mustache、Handlebars，和Hogan。它同樣也支持大量其他的。

假設你正使用Walrus。你將需要使用Consolidate來讓他適配Express。

```
npm i walrus consolidate --save
```

*app.js*：

```
const engines = require('consolidate');
const path = require('path');

const app = require('express')();

// 指定.wal文件作為你的文件後綴
app.set('view engine', 'wal');
// 將.wal文件綁定Walrus視圖引擎
app.engine('wal', engines.walrus);
// 指定你的視圖目錄
app.set('views', path.resolve(__dirname, 'views'));

// 渲染views/index.wal
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

## EJS中你必須要了解的東西

EJS(Embedded JavaScript)是最簡單，最受歡迎的視圖引擎之一。它可為簡單的字符串、HTML、純文本做模版 —— 由你指定。不管你使用任何工具都能輕鬆集成它。它工作在browser和Node中。

>Express版本要選：TJ Holowaychunk維護的版本。

### EJS語法

EJS可以用做HTML的模板，除此之外它還可以用於任何東西。

*test1.ejs*：

```
Hi <%= name %>!
You were born in <%= birthyear %>, so that means you're <%= (new Date()).getFullYear() - birthyear %> years old.
<% if(career) { -%>
<%=: career || capitalize %> is a cool career!
<% } else { -%>
Haven't started a career yet? That's cool.
<% } -%>
oh, let's read your bio: <%- bio %> See you later!
```

將下面內容傳入EJS：

```
{
    name: 'Tony Hawk',
    birthyear: 1968,
    career: 'skateboarding',
    bio: '<b>Tony Hawk</b> is the coolest skateboarder around.'
}
```

你將會返回這樣結果：

```

Hi Tony Hawk!
You were born in 1968, so that means you're 49 years old.
Skateboarding is a cool career!
oh, let's read your bio: <b>Tony Hawk</b> is the coolest skateboarder around. See you later!
```

這個小例子展示了EJS的四個特性：JavaScript取值(evaluated)、轉譯(escaped)以及打印(printed)；JavaScript取值但不打印；JavaScript取值並打印(但是不脫離HTML)；以及過濾。

可使用兩種方式打印JavaScript表達式的結果：

- `<% expression %>`：打印expression的結果
- `<%- expression %>`：打印expression的結果並轉譯任何內部的HTML條目。(推薦，更加安全)

你同樣可運行任意數量的JavaScript，並防止它被打印出來，這種特性對於循環和條件判斷很有用。它使用了`<% expression %>`。你可使用<% expression -%>來避免增加多餘的換行。

添加一個冒號(:)到輸出將會啟用過濾器。過濾器傳入一個表達式給輸出，並且它會改變輸出結果。例子是首字母大寫的過濾器。

>想玩EJS：[https://evanhahn.github.io/try-EJS/](https://evanhahn.github.io/try-EJS/)

在你自己的EJS頁面包含(include)其他模板：

*header.ejs*：

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/the.css">
    <title><%= appTitle %>/title>
</head>
<body>
    <header>
        <h1><%= appTitle %></h1>
    </header>
```

*footer.ejs*：

```
<footer>
    All content copyright <%= new Date().getFullYear() %> <%= appName %>.
</footer>
</body>
</html>
```

*index.ejs*：

```
<% include header %>
<h1>Welcome to my page!</h1>
<p>This is a pretty cool page, I must say.</p>
<% include footer %>
```

你同樣可以想像用它來構建一個組件。假設你有一個展示用戶檔案的組件。提供你一個名為user的對象，模板將會產出這個用戶的HTML。

*userwidget.ejs*：

```
<div class="user-widget">
    <img src="<%= user.profilePicture %>">
    <div class="user-name"><%= user.name %></div>
    <div class="user-bio"><%= user.bio %></div>
</div>
```

現在你可以在渲染當前用戶的時候使用這個模板了

```
<% user = currentUser %>
<% include userwidget %>
```

或者你可以在渲染用戶列表的時候使用它

```
<% userList.forEach(function(user) { %>
  <% include userwidget %>
<% } %>
```

EJS的include是多功能的；它可以用來構建模板或者多次渲染子視圖。

#### 添加你自己的過濾器

有22個內置的過濾器，從數字操作到陣列/字符串逆轉排序。它們通常能夠滿足你的需求，但有些時候你想要添加你自己的過濾器。

假設你已經將EJS引入到一個名為ejs變量中，你可簡單的添加一個屬性到`ejs.filters`。如果你頻繁地進行陣列求合，你會發現編寫一個你自定義的陣列求和過濾器十分有用。

```
ejs.filter.sum = function(arr) {
  var result = 0;
  for (var i = 0; i < arr.length; i++) {
    result += arr[i];
  }
  return result;
}
```

現在你可以像使用其他過濾器一樣使用它了。

```
<%= myarray | sum %>
```

十分簡單。你可以設計出大量的過濾器 — — 當你需要的時候編寫它們。

## Pug中你必須要了解的東西

像Handlebars、Mustache，以及EJS這樣的視圖引擎並沒有完全的替換HTML — — 它們添加了新功能。

Pug提供了其他特性。它允許你編寫更少行的代碼，並且你編寫的每一行代碼會更加漂亮。文檔類型的書寫變得很容易；標籤嵌套縮進，不用閉合。它有大量EJS風格的特性內置在語言中，例如判斷和循環。會有很多更強力的東西需要學。

### Pug語法

*hello-world.pug*：

```
doctype html
html(lang="en")
    head
        title Hello world!
    body
        h1 This is a Pug example
        #container
            p Wow.
```

*app.js*：

```
const app = require('express')();

app.set('view engine', 'pug');
app.set('views', require('path').resolve(__dirname, 'views'));

app.get('/hello-world', (req, res) => res.render('hello-world'));

app.listen(3000);
```

### Pug的布局

布局是所有模板語言的一個重要特性。它們允許你包括一個表單或另一個其他的HTML。它使得你定義一次header和footer，然後在你需要它們的時候將它們引入到頁面。

第一步，定義一個主布局，主布局定義一個block並將它填入到所有使用它的頁面：

```
doctype html
html
    head
        meta(charset="utf-8")
        title Cute Animals website
        link(rel="stylesheet" href="the.css")
        block header
    body
        h1 Cute Animals website
        block body
```

注意到你透過block header和block body定義兩個塊。它們將會把使用到的其他Pug文件填充到布局。

```
extends layout
block body
    p Welcome to my cute animals page!
```

可定義其他頁面，輕鬆使用這個布局：

```
extends layout
block body
    p This is another page using this layout.
    img(src="cute_dog.jpg" alt="A cute dog!")
    p Isn't that a cute dog!
```

布局使你分離出常規的組件，這也意味你不用反覆編寫同樣的代碼。

### 混入Pug

Pug還有一種被稱為混入的酷炫特性，這是你在Pug文件中定義的功能，用於削減重複的任務。

```
mixin user-widget(user)
    .user-widget
        img(src=user.profilePicture)
        .user-name= user.name
        .user-bio= user.bio

extends layout
block body
    +user-widget(currentUser)

    - each user in userList
        +user-widget(user)
```

## 總結

Express擁有一個用於動態渲染HTML頁面的視圖系統。你傳入變量調用`res.render`來動態渲染視圖。在這之前，你必須給Express配置正確的視圖引擎和正確的視圖文件夾。

EJS模板語言是在HTML之上的一層包裝層，它添加了透過JavaScript動態生成HTML的能力。

模板語言Pug重朔了HTML，它使你透過全新的語言渲染HTML。它的目的是消除冗長的編碼。