# chap03. Express基礎

>本章涵蓋
>Express的四個特性
>中間件讓一個請求流過更多的頭部
>路由用來處理特定的請求
>便捷的函數和屬性
>動態渲染HTML的視圖

Node.js攜帶了很多內置方法。其中有一個叫做http的。Node的http模組允許你創建一個HTTP server來響應瀏覽器的HTTP請求。簡而言之，http模組讓你透過Node建構網站。

儘管你可以在不用其他東西的情況下建立完整的web server，但你可能不想要web server出現node的內置http模組。API公開的http模組十分的簡單，它並不能勝任繁重的事情。

這就是Express帶來的：一個有用的第三方模組。Express是一個基於Node內置HTTP服務的抽象層。Express平滑了很多困難的部分。

總體來說，Express提供4個你將在本章學到的主要特性：

- 中間件：與基本的Node形成對比，你的請求只流過一個函數，Express擁有一個中間件棧，實際上是一個有效的函數數組。
- 路由：路由有一點像中間件，但是函數只有當你透過一種**特定HTTP方式**訪問一個**特定URL**的時候才會被調用。
- 擴展request和response：Express透過額外的用於便利開發者的函數和屬性擴展了request和response對象。
- 視圖：試圖允許你動態渲染HTML。它既可讓你動態改變HTML也可讓你用別的語言寫HTML。

本章會搭建簡單的留言板感受這四個特性。

## 中間件

Express中最大的特性被稱為中間件。中間件與你看到的原生Node請求處理函數十分相似(接收一個req與返回一個res)，但中間間件有一點不同：它不僅只有一個處理函數，中間件允許多個處理**按序**執行。

中間間有各種各樣的運用。例如：一個中間件可以記錄所有請求，接著繼續其他的中間件為每個請求設置特定的HTTP頭，然後向遠處繼續傳遞。

>中間件不是Express特有的；它以不同形式出現在很多地方。中間件出現在像Python的Django或是PHP的Laravel這樣的web應用框架裡。Ruby的web應用程序同樣有這種概念，通常被稱為Rack中間件。儘管Express有它自己的特點。

### Express版Hello World

*package.json*：

```
{
  "name": "hello-world",
  "author": "eden90267",
  "private": true,
  "dependencies": {
    "express": "^4.15.3"
  }
}
```

*app.js*：

```
var express = require('express');

var http = require('http');

var app = express();

// 中間件
app.use(function (req, res) {
    console.log('In comes a request to: ' + req.url);
    res.end('Hello World!');
});

http.createServer(app).listen(3000);
```

調用express()，**返回了一個請求處理函數**。這很重要，它意味你可以傳遞結果到http.createServer。

還記得前一張原生的Node請求處理？like this：

```
function requestHandler(request, response) {
    console.log("In comes a request to: " + request.url);
    response.end("Hello, world!");
}
```

app只是一個函數，它是一個Express產生的請求處理，它將開始透過所有中間件直到最後。在工作完成的時候，它只一個請求處理函數就跟之前一樣。

>你將看到人們app.listen(3000)，來替代http.createServer。app.listen只是簡寫，就像你使用request的縮寫req和response的縮寫res。

### 中間件如何在高層次工作

Node的HTTP服務中，所有的請求透過一個大的函數。這看起來像下面代碼：

```
function requestHandler(request, response) {
    console.log("In comes a request to: " + request.url);
    response.end("Hello, world!");
}
```

在一個沒有中間件的世界。你發現有一個主要的請求函數處理所有事情：

![](https://i.imgur.com/QzfLXpY.png)

每一個請求僅僅透過一個請求處理函數，最後生成一個回應。

透過中間件，而不是將請求透過一個你寫的函數，他被透過一個被稱為中間件棧的存放數組的函數。

![](https://i.imgur.com/fjZZ1C4.png)

所以Express讓你執行一個數組的函數來取代單獨的一個函數。

再來看一個第一章的例子：一個驗證用戶的應用程序。如果它們被驗證，它將顯示秘密信息。

![](https://i.imgur.com/uEG0m5G.png)

每一個中間件函數都可以修改req或者res，但是它並不總是需要那麼做。最後，一些中間件應當響應這個請求。如果沒有一個中間件響應，那個時候server將掛起並且瀏覽器將獨自等待，沒有響應。

這是強而有力的，你可以將你的應用程序拆分很多小部分，而不是一個巨大的。這些組建變得容易組成和重新排列，並且容易引入第三方中間件。

使用Express將變得更清晰。

### 被動的中間件代碼

中間件可以影響response，但是它並不是必須的。例如，前小節的日誌記錄中間件並不需要發送不同的數據——它只需要紀錄請求並繼續前進。

```
function myFunMiddleware(req, res, next) {
    // ...   // 透過request/response做一些事情
    next();  // 當完成的時候，調用next()鏈式順延下一個中間件
}
```

增加簡單日誌功能：

```
var express = require('express');
var http = require('http');
var app = express();

// 日誌記錄中間件
app.use(function (req, res, next) {
    console.log('In comes a ' + req.method + ' to ' + req.url);
    next();
});

// 發送實際欄位
app.use(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World!');
});

http.createServer(app).listen(3000);
```

### 改變request和response中間件代碼

不是所有中間件都是被動的，實際上它需要改變response。

讓我們嘗試編寫權限驗證中間件，我們採用一個奇怪的身份驗證方式：你只能在每個小時的偶數分鐘透過驗證。

```

var express = require('express');
var http = require('http');
var app = express();

// 日誌記錄中間件
app.use(function (req, res, next) {
    console.log('In comes a ' + req.method + ' to ' + req.url);
    next();
});

app.use(function (req, res, next) {
    var minute = new Date().getMinutes();
    if (minute % 2 === 0) {
        next();
    } else {
        res.statusCode = 403;
        res.end('Not authorized.');
    }
});

// 發送實際欄位
app.use(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Secret info: the password is "swordfish"!'); // 發送密碼信息
});

http.createServer(app).listen(3000);
```

### 第三方中間件庫

你可以寫你自己的中間件，但是通常會發現這個你想要的功能已經在別人的中間件實現了。來看幾個有用的中間件的例子。

#### MORGAN：日誌紀錄中間件

我們使用一個很棒的有很多特性的Express日誌記錄器Morgan。日治記錄器之所以很有幫助是有原因的。首先，這是一種了解你的用戶做了什麼的方法。雖不及市場銷售分析為最好的方法，但是它在你的app因為用戶的使用而崩潰，但你不知道原因的時候是十分有用的。我發現開發的時候他同樣很有幫助——你可以看到請求到達你的server。如果有誤，你可使用Morgan的日誌紀錄進行合理的檢查。你也可以看到你的server需要多長的時間反應作性能分析。

運行`npm install morgan --save`嘗試一下：

```
var express = require('express');
var logger = require('morgan');
var http = require('http');

var app = express();

app.use(logger('short')); // 有趣的事實：logger('short')返回一個函數

// 發送實際欄位
app.use(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, world!'); // 發送密碼信息
});

http.createServer(app).listen(3000);
```

訪問http://localhost:3000你將看到一些日誌紀錄！感謝Morgan。

#### Express的靜態中間件

你需要透過網路發送靜態文件在Web應用程序中很常見。這裡包括像圖片或CSS或HTML這樣的東西——內容並不是動態的。

Express附帶了express.static並幫助你提供靜態文件。一個簡單的發送文件行為需要大量的工作。因為存在大量的邊界情況以及需要考慮到性能問題。Express快來救命！

假設你想要從一個叫做public的文件夾提供文件服務：

```

var express = require('express');
var path = require('path');
var http = require('http');

var app = express();

var publicPath = path.resolve(__dirname, "public"); // 使用Node的path模組設置public的路徑

app.use(express.static(publicPath)); // 從publicPath目錄發送靜態文件


app.use(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Looks like you did't find a static file.");
});

http.createServer(app).listen(3000);
```

如果有找到匹配文件，express.static會發送它並停止中間件鏈。

>`path.resolve`：因windows與Mac/Linux中的目錄不同：*\public*與*/public*。

#### 尋找更多的中間件

這裡有幾個別的有用的中間件：

- **connect-ratelimit**：讓你控制每個小時的請求連接數。如果有人給你的server發送很多的請求，你可以給他們發送錯誤信息並停止他們訪問你的網站。
- **Helmet**：幫助你添加HTTP頭信息來讓你的app防止一些攻擊從而變得更安全(後續會提到)。
- **cookie-parser**：解析瀏覽器cookie
- **response-time**：發送X-Response-Time頭使你可以調試你的應用程序性能。

尋找更多中間件，可搜尋“Express middleware”，同樣可搜索“Connect middleware”。類似Express這是另外一個叫做Connect的框架，不過它僅僅只關注中間件。Express兼容Connect的中間件。

## 路由

路由是一種透過URL和HTTP動作，映射到特定的請求處理的方式。

```

var express = require('express');
var path = require('path');
var http = require('http');

var app = express();

// 像之前一樣設置靜態文件中間件
// 所有請求透過這個中間件，如果沒有文件被找到的話會繼續前進
var publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));


app.get('/', function (req, res) {
    res.end('Welcome to my homepage!');
});

app.get('/about', function (req, res) {
    res.end('Welcome to the about page!');
});

app.get('/weather', function (req, res) {
    res.end('The current weather is NICE');
});


// 如果你錯過了其他的，你將會出現在這裡
app.use(function (req, res) {
    res.statusCode = 404;
    res.end("404");
});

http.createServer(app).listen(3000);
```

這些路由可以變得更智能。另外它們可以匹配更複雜的固定路徑(正則表達式或更複雜的解析)：

```
app.get('/hello/:who', function (req, res) {
    // req.params有一個who屬性
    res.end('Hello, ' + req.params.who + '.');
    // 有趣的事實：我們這樣做會有一些安全問題
});
```

在路由中who並不是固定的值。Express會傳入來訪URL的值並將它設置為你指定的名字。

注意到你在後面追加東西後它將不再運作。例如：localhost:3000/hello/entire/earth會得到一個404錯誤。

使用Express，不是給每一個可能的用戶名(或文章、或相片、或其他的)定義一個路由，而是你定義一個路由來匹配所有的。

## 擴展request和response

Express添加的request和response對象透過每一個請求處理。舊的東西依然存在，但是Express還添加了新的東西。讓我們看幾個例子：

Express提供了一個非常棒的方法**redirect**。

```
response.redirect('/hello/world');
response.redirect('http://expressjs.com');
```

如果你只使用Node，並不會有一個叫做redirect的方法；Express為你把它添加到response對象中。

Express添加了像**sendFile**這樣的方法，你可以**發送整個文件**，就像下面代碼：

```
response.sendFile('/path/to/cool_song.mp3');
```

sendFile方法在原生Node中並不存在；Express為你添加了它。

不僅是response對象帶來便利性——request對象也獲得大量的酷炫屬性和方法，例如**request.ip**可以獲取IP地址或者**request.get**方法可獲得傳入的HTTP頭。

來使用一些東西來建構非法IP黑名單的中間件：

```
var express = require('express');
var app = express();


var EVIL_IP = '123.45.67.89';

app.use(function (req, res, next) {
    if (req.ip === EVIL_IP) {
        res.status(401).send('Not allowed!');
    } else {
        next();
    }
});

// ... 你app的其他代碼 ...
```

注意到你使用了**req.ip**，一個叫做**res.status()**的函數，和一個**res.send()**。它們中沒有一個是原生Node有的 —— 它們都是透過Express擴展的。

## 視圖

網站是基於HTML建立的。它們已經透過這種方式建立很長世間了。通常你想要server動態生成HTML。你可能想要提供歡迎當前登入用戶的HTML，或者可能你想要動態生成資料表。

有一些不同的視圖引擎可以用。例如**EJS**(可以用嵌入JavaScript)、**Handlebars**、**Pug**，以及更多。甚至有來自別的編程語言世界移植的模板語言，例如Swig和HAML。他們有一個共同的特性，最終它們都會變成HTML。

餘下例子中，我們將使用EJS。選擇EJS是因為一方面它很流行，另一方面它的作者也是Express的作者。

下面代碼展示他如何建立視圖：

```
var express = require('express');
var path = require('path');
var http = require('http');

var app = express();

// 告訴Express你的視圖存在於一個名為views的文件夾中
app.set('view', path.resolve(__dirname, 'views'));
// 告訴Express你將使用EJS模板引擎
app.set('view engine', 'ejs');
```

EJS是一個把代碼編譯成HTML的模板語言。確保透過`npm install ejs --save`安裝它。

views/index.ejs：

```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello, world!</title>
</head>
<body>
<%= message %>
</body>
</html>
```

對你來說可能十分像HTML，但是在body裡有一個怪異的標籤。EJS是一個HTML的超集，所以任何在HTML中有效地在EJS中同樣有效。但EJS添加了一些新特性，例如插入變量。當你從Express渲染視圖，`<%= message %>`將插入Express傳遞的一個名為message的變量。

```
app.get('/', function (req, res) {
    res.render('index', {
        message: 'Hey everyone! This is my webpage.'
    });
});
```

Express給response添加了一個render方法。它會**查看視圖引擎和視圖目錄(你前面定義的views)**以及透過你傳遞的變量渲染index.ejs。

以下是被渲染的HTML：

```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello, world!</title>
</head>
<body>
Hey everyone! This is my webpage.
</body>
</html>
```

EJS是流行的視圖解決方案，但還有很多其他的選擇。

## 實例：透過一個留言板把他們組織起來

- 一個主頁用於列出所有之前在留言板發佈的條目。
- 一個用於“添加新條目”的表單頁面。

*package.json*：

```
{
  "name": "express-guestbook",
  "private": true,
  "scripts": {
    "start": "node app"
  }
}
```

```
npm install express morgan body-parser ejs --save
```

你的app需要透過HTTP POST請求來發布一條新的留言板條目，所以你將解析POST的body部分；當有一個body到來的時候。

### app核心代碼

*app.js*：

```

var http = require('http');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

// 第一行告訴Express視圖存在一個views文件中
// 下一行表明視圖將使用EJS引擎
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', "ejs");

// 創建一個global的陣列用於儲存所有的條目
var entries = [];
// 使這個條目陣列可以在所有視圖中訪問
app.locals.entries = entries;

// 使用Morgan來記錄每次request請求
app.use(logger('dev'));

// 填充一個req.body變數如果用戶提交表單的話(擴展項是必須的)
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/new-entry', function (req, res) {
    res.render('new-entry');
});

app.post('/new-entry', function (req, res) {
    if (!req.body.title || !req.body.body) {
        res.status(400).send('Entries must have a title and a body.');
        return;
    }
    entries.push({
        title: req.body.title,
        content: req.body.body,
        published: new Date()
    });
    res.redirect('/');
});

app.use(function (req, res) {
    res.status(404).render('404');
});

http.createServer(app).listen(3000, function () {
    console.log('Guestbook app started on port 3000.');
});
```

### 創建視圖

*views/header.ejs*：

```
<!DOCTYPE html>
<html lang="">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>Express Guestbook</title>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
    <!--[if lt IE 9]>
    <script src="//cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body class="container">

<h1>
    Express Guestbook
    <a href="/new-entry" class="btn btn-primary pull-right">
        Write in the guestbook
    </a>
</h1>
```

接下來，在*views/footer.ejs*新建一個將在每一個頁面底部出現的簡單footer，就像下面這樣。

```

<script src="//code.jquery.com/jquery.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
</body>
</html>
```

接下來你可以定義三個視圖：主頁、“添加新項目”頁，還有404頁面。保存下面代碼*views/index.ejs*：

```
<% include header %>

<% if (entries.length) { %>
  <% entries.forEach(function(entry) { %>
    <div class="panel panel-default">
        <div class="panel-heading">
            <div class="text-muted pull-right">
                <%= entry.published %>
            </div>
            <%= entry.title %>
        </div>
        <div class="panel-body">
            <%= entry.body %>
        </div>
    </div>
  <% }) %>
<% } else { %>
No entries! <a href="/new-entry">Add one!</a>
<% } %>

<% include footer %>
```

*views/new-entry.ejs*：

```
<% include header %>

<h2>Write a new entry</h2>
<form method="post" role="form">
    <div class="form-group">
        <label for="title">Title</label>
        <input type="text" class="form-control" id="title" name="title" placeholder="Entry title" required>
    </div>
    <div class="form-group">
        <label for="body">Entry text</label>
        <textarea class="form-control" name="body" id="body" placeholder="Love Express! It's a great tool for building website" rows="3" required></textarea>
    </div>
    <div class="form-group">
        <input type="submit" value="Post entry" class="btn btn-primary">
    </div>
</form>

<% include footer %>
```

*views/404.ejs*：

```
<% include header %>

<h2>404! Page not found</h2>

<% include footer%>
```

## 總結

Express基於Node的HTTP功能。它抽象了許多粗糙的邊緣。

Express有一個中間件的特性，它允許你在管道中將一個請求透過一些列分離的函數。

Express的路由特性讓特定的HTTP請求映射到特定的功能。例如，當訪問主頁，特定的代碼將被運行。

Express的視圖渲染特性讓你動態的渲染HTML頁面。

很多模板引擎已經移植到Express。一個叫EJS的很流行，它對於已經知道HTML的人來說是最簡單的。