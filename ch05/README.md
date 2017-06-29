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

可匹配`/user/123`、`/user/8`。雖然它不會在缺少參數時匹配`/users/`或超參數時的匹配`/user/123/ports`，但是它可匹配的東西可能會超出你的預期。它同樣可以匹配`/users/cake`和`/users/horse_ebook`。如果你想匹配更加獨特的請求，這時候你需要一些參數。

### 使用正則表達式匹配路由

Express允許你把路由字符串指定為正則表達式。透過正則表達式能給你更多的路由控制權，你同樣可以使用正則表達式去匹配參數。

>正則表達式可參考：[https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Regular_Expressions)

假設你想要匹配`/users/123`或`/users/456`但不匹配`/users/olivia`。你可以給它編寫正則表達式並捕獲數字：

```
// 使用正則表達式定義路由URL並捕獲數字
app.get(/^\/users\/(\d+)$/, (req, res) => {
    // 透過序列號接收參數
    let userId = parseInt(req.params.userid, 10);
    // ...
});
```

這是一種"約束用戶ID必須為整數"的辦法。

正則表達式可能在閱讀的時候有些困難，但是你可以使用它們來定義更加複雜的路由規則。例如，你想定義一個路由查找範圍；即，如果你訪問/users/100-500，你可以看到ID號從100到500的用戶。

```
// 使用正則表達式定義路由規則
app.get(/^\/users\/(\d+)-(\d+)$/, (req, res) => {
    // 捕獲第一個參數並對其類型進行轉換
    let startId = parseInt(req.params[0], 10);
    // 捕獲第二個參數，並對其類型進行轉換
    let endId = parseInt(req.params[1], 10);
    // ...
});
```

你可以遐想這些數字可能被擴展了。例如，定義路由匹配UUID

```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

其中，x是任何的十六進制數字，而y只能是8，9，A或者B：

```
const HORRIBLE_REGEXP = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/

app.get(HORRIBLE_REGEXP, (req, res) => {
    let uuid = req.params[0];
    // ...
});
```

### 捕獲查詢參數

另一種常用的動態傳入URL信息的方法是查詢字符串(query string)。

```
app.get('/search', (req, res) => {
    // req.query.q == 'javasript-themed burrito'
})
```

這個處理方式十分的簡單，但是他允許你透過這種方式獲取到查詢。

>**注意** 很不幸，查詢參數通常會存在安全問題。如果你訪問`?arg=something`與`?arg=something&arg=somethingelse`，req.query.arg各自接到的是字符串與陣列。總之，你不要輕易斷定你獲取到的是一個字符串或一個陣列。

## 使用Router劃分你的app

Express 4添加了一個Router的特性用於解決這個路由數增長帶來的痛點，引用一下Express的文檔：

>Router獨立於中間件和路由。Router可以認為是一個只能執行中間件和路由的迷你應用程式。每個express應用程序都有一個內置的appRouter。

Router的行為類似中間件，它可透過".use()"使用其他的Router。換句話說，Router允許你將app劃分為很多小塊的迷你app，並且可以在之後將它們組織起來。

```

const express = require('express');
const path = require('path');

const apiRouter = require('./routes/api_router');

const app = express();

const STATIC_PATH = path.resolve(__dirname, "static");
app.use(express.static(STATIC_PATH));

// 使用你自己的Router
app.use('/api', apiRouter);

app.listen(3000);
```

router基本都是中間件。

接下來定義你的router。把它當作一個子應用：

```

const express = require('express');

const ALLOWED_IPS = [
    "127.0.0.1",
    "123.456.7.89"
];

const api = express.Router();

api.use((req, res, next) => {
    let userIsAllowed = ALLOWED_IPS.indexOf(req.ip) !== -1;
    if (userIsAllowed) {
        res.status(401).send('Not authorized!');
    } else {
        next();
    }
});

api.get('/users', (req, res) => {
    /* ... */
});
api.post('/users', (req, res) => {
    /* ... */
});

api.get('/messages', (req, res) => {
    /* ... */
});
api.post('/messages', (req, res) => {
    /* ... */
});

module.exports = api;
```

它看起來像一個迷你的小應用程序；他支持中間件和路由。最主要差別就是它不能獨立存在；它必須嵌入到一個成熟的app中。Router可以在大型app中做到跟路由同樣的事情，並且它們還可以使用中間件。

你可想像編寫一個攜帶很多子router的router。可能你想要讓你的API router進一步推廣到，用戶router和消息router再或許是其他的什麼。

## 提供靜態文件

### 使用靜態文件中間件

第二章的例子：

```

const express = require('express');
const path = require('path');
const http = require('http');

const app = express();

const PUBLISH_PATH = path.resolve(__dirname, 'public');
app.use(express.static(PUBLISH_PATH));

app.use((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Looks like you didn't find a static file.");
});

http.createServer(app).listen(3000);
```

回想到`path.resolve`可以幫助你解決路徑的跨平台問題。

現在讓我們進行深入探究。

#### 改變用戶路徑

如果你想要安裝不同的URL給用戶提供靜態文件。例如，你可能想要在一個文件夾中存放大量無理的但是有趣的圖片，並把這個文件夾命名為offensive，所以一個用戶可以訪問[http://jokes.edu/offensive/photo123.jpg](http://jokes.edu/offensive/photo123.jpg)。你應該如何做到?

拯救我吧Express!中間件可以安裝在一個指定的前綴。換句話說，你可以編寫一個中間件只用於響應/offensive開頭的地址：

```
// ...
const photoPath = path.resolve(__dirname, "offensive-photo")
app.use('offnsive', express.static(photoPath));
// ...
```

#### 多個靜態文件的路由

例如，有時我會有一個名為public的靜態文件夾和另一個靜態文件夾user_uploads。在Express中應該如何做?

Express透過內置中間件的特性解決了這問題，因為`express.static`是一個中間件，你對他進行多次調用。你可以這麼做。

```
// ...
const PUBLISH_PATH = path.resolve(__dirname, 'public');
const USER_UPLOAD_PATH = path.resolve(__dirname, 'user_uploads');

app.use(express.static(PUBLISH_PATH));
app.use(express.static(USER_UPLOAD_PATH));
// ...
```

一如既往，你可以給中間件設置不同的路徑：

```
app.use('/public', express.static(PUBLISH_PATH));
app.use('/uploads', express.static(USER_UPLOAD_PATH));
```

### 靜態文件路由

可能你想要透過路由發送一個靜態文件。你可能想要在用戶訪問*/users/123/profile_photo*時發送一個用戶個人圖片。這個靜態中間件沒有辦法知道這些，但是Express有一個很棒的解決方法，他採用很多相同的內部機制作為中間件。

假設你想要在有人訪問*/users/:userid/profile_photo*時發送個人圖片。再假設你有一個叫`getProfilePhotoPath`的神奇函數，它接收一個用戶ID並返回這個路徑對應的個人圖片:

```
app.get('/users/:userid/profile_photo', (req, res) =>
    res.sendFile(getProfilePhotoPath(req.params.userid));
);
```

## 在Express中使用HTTPS

HTTPS為HTTP添加了一層安全層。這個安全層叫做TLS(Transport Layer Security)或者SSL(Secure Sockets Layer)。這兩個名字可以相互交換，但是TLS在技術上涵蓋了SSL。

TLS使用所謂的公開密鑰加密，它的工作原理大概是這樣：每個對等的人都會有一個分享給所有人的公鑰和一個不分享給任何人的私鑰。如果我想要給你發送一些東西，我先會用自己的私鑰(可能很多人在用我的電腦)給信息加密，再用你的公鑰(它公開給任何人)進行加密。我可以讓發送給你信息對竊聽者來說就像是一堆垃圾信息，然後你用你的私鑰和我的公鑰對信息解密。透過這個又酷又瘋狂的數學，我們甚至可以在他人想要監聽我們的時候進行會話加密，並且我們事先並不需要對使用某種密碼達成一致。

如果覺得這有點頭暈，只要記住兩個對等的人，擁有一個私鑰和一個公鑰。在TLS中，公鑰同樣有一個被稱為證書的特性。如果我正在和你對話，你將向我展示你的證書(也叫公鑰)，我驗證了它是你從可信證書頒發機構中獲取的然後說"是的，這是你。"你的瀏覽器有一個可信任證書頒發機構的列表；VeriSign和Google這樣的公司進行這些證書頒發機構，稱為CAs。

我把證書頒發機構想像成一個保鑣。當我跟某人說話的時候，我望向我的保鑣然後說"嘿，這個在說話的人有說它是誰嗎?"我的保鑣低頭望向我然後點頭或者搖頭。

>有些類似Heroku的虛擬主機供應商已經為你做了一切HTTPS要做的事情，所以你並不需要擔心。本部分只有在你想要自己實現HTTPS的時候才有用。

首先，你得透過OpenSSL生成自己的公鑰和私鑰。

```
openssl genrsa -out privatekey.pem 1024
openssl req -new -key privatekey.pem -out request.pem
```

第一條命令會在privatekey.pem中生成你的私鑰；任何人都可以做到這一點。下一條命令生成一個證書簽名請求。它會詢問你一堆信息然後將他們導入到request.pem中。現在開始，你需要從CA中請求一個證書。互聯網上的一些研究小組正在致力於我們的加密，以及免費自動化CA。你可以在[https://letsencrypt.org/](https://letsencrypt.org/)查看這個服務。如果你喜歡其他的證書，你可以自己到網上選購。

你一旦有了一個證書，你可以在Express使用Node的內置HTTPS模組，就像之後代碼清單中所展示的，與HTTP不同的是，你要提供你的證書和私鑰：

```

const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
// ... 定義你的app ...

// 定義一個對象來保存證書和私鑰
const httpsOptions = {
    key: fs.readFileSync('path/to/private/key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};
// 將這個對象傳入http.createServer
https.createServer(httpsOptions, app).listen(3000);
```

如果你想要同時運行HTTP和HTTPS服務：

```

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

// ... 定義你的app ...

const httpsOptions = {
    key: fs.readFileSync('path/to/private/key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

http.createServer(app).listen(80);
https.createServer(httpsOptions, app).listen(443);
```

你需要做的只是在不同端口啟動它們，這就是HTTPS。

## 把它們整合起來：一個簡單的路由示例

建構一個簡單的web應用程序：讓他返回美國溫度編碼。

這個應用程序有兩個部分：一個主頁，用於詢問用戶的ZIP編碼，以及一個路由用於發送溫度的JSON數據。

### 設置

在這應用中，你會用到Node包：Express、ForecastIO(透過一個叫Forecast.io免費API獲取天氣數據)、Zippity-do-dah(將ZIP編碼轉為緯度/經度組合)、EJS。

```
{
  "name": "temperature-by-zip",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "ejs": "^2.5.6",
    "express": "^4.15.3",
    "forecastio": "^1.0.2",
    "zippity-do-dah": "0.0.3"
  }
}
```

在客戶端，你將依賴於jQuery和一個叫做Pure的迷你CSS框架。

創建兩個目錄：public和views。

接下來到Forecast.io官網[https://developer.forecast.io](https://developer.forecast.io)獲取一個API密鑰。

### 主app的代碼

*app.js*：

```

const path = require('path');
const express = require('express');
const zipdb = require('zippity-do-dah');
const ForecastIo = require('forecastio');

const app = express();

let weather = new ForecastIo('fab43854133d52d7ab2718c7cd06b3d6');

app.use(express.static(path.resolve(__dirname, 'public')));

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.get(/^\/(\d{5})$/, (req, res, next) => {
    // 捕獲特定的ZIP編碼透過req.params[0]
    let zipcode = req.params[0];
    // 透過ZIP編碼獲取地理位置
    let location = zipdb.zipcode(zipcode);
    if (!location.zipcode) {
        return next();
    }

    let latitude = location.latitude;
    let longitude = location.longitude;

    weather.forecast(latitude, longitude, (err, data) => {
        if (err) {
            return next();
        }

        // 透過Express的json方法發送一個JSON數據
        res.json({
            zipcode: zipcode,
            temperature: data.currently.temperature
        });
    });

});

app.use((req, res) => res.status(404).render('404'));

app.listen(3000);
```

### 兩個視圖

*header.ejs*：

```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Temperature by ZIP code</title>
    <link rel="stylesheet" href="//yui.yahooapis.com/pure/0.6.0/pure-min.css">
    <link rel="stylesheet" href="/main.css">
</head>
<body>
```

*footer.ejs*：

```
</body>
</html>
```

*404.ejs*：

```
<% include header %>

<h1>404 error! File not found.</h1>

<% include footer %>
```

*index.ejs*：

```
<% include header %>

<h1>What's your ZIP code?</h1>

<form class="pure-form">
    <fieldset>
        <input type="number" name="zip" placeholder="12345" autofocus required>
        <input type="submit" class="pure-button pure-button-primary" value="Go">
    </fieldset>
</form>

<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="/main.js"></script>

<% include footer %>
```

*public/main.css*：

```
html {
    display: table;
    width: 100%;
    height: 100%;
}
body {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
}
```

*public/main.js*：

```
$(function () {
    var $h1 = $('h1');
    var $zip = $("input[name='zip']");

    $('form').on('submit', function (event) {
        // 禁止表單的默認提交
        event.preventDefault();

        var zipCode = $.trim($zip.val());
        $h1.text('Loading...');

        // 發送一個AJAX請求
        var request = $.ajax({
            url: '/' + zipCode,
            dataType: 'json'
        });

        request.done(function (data) {
            // 當請求成功時將頭部更新為當前的天氣
            var temperature = data.temperature;
            // °是HTML中表示程度的符號
            $h1.html('It is ' + temperature + '° in ' + zipCode + '.');
        });
        // 當請求失敗時確保會有錯誤提示
        request.fail(function () {
            $h1.text('Error!');
        });
    });
});
```

## 總結

路由映射HTTP動詞和一個URI。

路由可以映射一個簡單的字符串，它同樣也可以匹配參數或者正則表達式。

Express擁有解析查詢字符串的能力。

為了方便，Express攜帶了一個內置的中間件用於處理靜態文件。

Router可以將你的應用程序劃分很多子應用程序，這將有助於你進行代碼組織。

你可以利用在證書在Express使用HTTPS。