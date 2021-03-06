# chap06. 構建API

API(application programming interface)，可說是軟件接口，意味著是被代碼使用的。UI則是給人類用戶使用的。某種程度來說，UI是建立在軟件接口之上的──也就是建立在一些API之上。

總體來說，API是一種一塊代碼與另一塊別的代碼之間交互的方式。這可能意味著一台計算機跟它自己交互或者一台計算機跟另外一台計算機透過網路交互。例如：一個視頻遊戲可能使用一個允許代碼在屏幕中繪圖的API。你已經見過Express中可用的方法，像app.use或app.get。這些接口允許程序用來與別的代碼進行交互。

API兩台交互的計算機使用HTTP或者其他協議發送同意的數據交互方式(text、json或xml)，而這些計算機可能運行不同的編程語言，不同的操作系統。本章中，你將使用json創建API。

我們將透過Express構建應用來討論API交互。這些API接受一個HTTP請求然後返回JSON數據。

設計一個好的API背後的核心原則是提供開發者想要使用的API。

## 一個基本的JSON API示例

你的API接受像這樣的URL發來的HTTP請求：

```
/timezone?tz=America+Los_Angeles
```

並且，你的API服務器需要透過JSON進行響應：

```
{
    "time": "2015-06-09T16:20:00+01:00".
    "zone": "America/Los_Angeles"
}
```

如果你創建了一個API，它接受一個來自計算的request請求，接著返回響應到計算機，你可以基於API來構建UI。

## 一個利用Express提供JSON API的小例子

Express API基本原理十分簡單：接收一個請求，解析它，然後利用JSON對象和HTTP狀態碼進行響應。你將使用中間件和路由來接收請求並對請求進行解析。

我們來編寫一個產生隨機整數的簡單API。這個API將會擁有下面這些特性：

- 請求API的時候必須要攜帶一個最小值和一個最大值
- 你的server將解析這些值，然後計算你的隨機數，最後以JSON的形式返回。

*package.json*：

```
{
  "name": "random-number-api",
  "private": true,
  "scripts": {
    "start": "node app"
  },
  "dependencies": {
    "express": "^4.15.3"
  }
}
```

*app.js*：

```

const express = require('express');

const app = express();

app.get('/random/:min/:max', (req, res) => {
    let min = parseInt(req.params.min, 10);
    let max = parseInt(req.params.max, 10);

    if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({error: 'Bad request'});
    }

    let result = Math.round((Math.random() * (max - min)) + min);

    res.json({result: result});
});

app.listen(3000, () => console.log('App started on port 3000'));
```

HTTP狀態碼設置為400，你看到過404錯誤，它其實是400的變種：它標示著一些用戶的請求出了問題。

以上展示了一個相當基本的API，它利用Express構建API的最簡單的方法：解析請求，設置HTTP狀態碼，然後發送JSON。

## 創建(Create)，讀取(Read)，更新(Update)，刪除(Delete) API

### HTTP動詞(也稱為HTTP方法)

HTTP規範定義了這樣的方法：

>該方法標記指示要再由請求URI標示的資源的執行方法。並且這個方法是區分大小寫的。

HTTP並不具備記憶能力，雖然你不能用它定義任何你想要的方法，但是web應用程序通常使用下面四種形式：

- GET：

    用來獲取資源。GET方法不應該改變app狀態。幂等性特性，做一次事情跟做多次事情是等效的。

- POST：

    用於請求改變server狀態。POST用於在server上創建紀錄，但不會改變任何已經存在的紀錄。

- PUT：

    可能'更新'或者'改變'更適合做它的名字。

    如果你嘗試用PUT改變一條不存在的紀錄，server可以創建這條紀錄(但不是必須的)。你可能不想更新不存在的配置，但是你可能想要更新一個個人網站上不存在的頁面。

    PUT是幂等的。代表說它不是從之前資料改變成之後資料，而是改成之後資料，我並不關心之前的資料是什麼。我不管做幾次，資料都是變更後的資料。

- DELETE：

    DELETE跟PUT的幂等形式相同，我不管刪除一次或500次，反正資料它消失了。

下個代碼清單中將包含一個用簡短信息回復每個不同動詞的簡單應用程序：

```
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('you just send a GET request, friend'));

app.post('/', (req, res) => res.send('a POST request? nice'));

app.put('/', (req, res) => res.send("i don't see a lot of PUT requests anymore"));

app.delete('/', (req, res) => res.send('oh my, a DELETE??'));

app.listen(3000, () => console.log('App is listening on port 3000'));
```

```
$ curl http://localhost:3000
you just send a GET request, friend

$ curl -X POST http://localhost:3000
a POST request? nice

$ curl -X PUT http://localhost:3000
i don't see a lot of PUT requests anymore

$ curl -X DELETE http://localhost:3000
oh my, a DELETE??
```

### 透過HTTP方法構建的CRUD程序

>**POST對比PUT**
>
>創建和更新是比較模糊的，因為PUT可以像POST一樣創建一條紀錄，可以說PUT可以更好的對應到創建。PUT可以創建和更新紀錄，但是為什麼不把它應用到這兩個應用場景呢?
>
>同樣的，PATCH方法有時同樣可以發揮更新的作用。引用HTTP規範，"PUT方法已經被定義為，用一個完整的新個體來覆蓋資源，而且它不能重複使用作局部變化。"PATCH允許你部分覆蓋一個資源。PATCH在2010才被正式定義，所以它在HTTP的應用場景相對較新的，這也是它較少使用的原因。總之，有些人認為PATCH比PUT更適合於更新這個應用場景。

## API版本

更版API，並且讓老客戶可以持續使用。有一個可以解決這一切的問題：版本化你的API。你所需要做的僅僅是給你的API添加版本信息。

所以接收的請求URL可能是API的版本1：

```
/v1/timezone
```

並且你可以請求這樣的URL來獲取版本2的API：

```
/v2/timezone
```

這使得你可以透過創建一個新的版本對API進行輕鬆的改變。

Express透過router可以輕鬆地對API版本進行分離，為創建API版本1，你可以創建一個專門的router來處理這個版本。這個文件可命名為*api1.js*：

```

const api = require('express').Router();

api.get('/timezone', (req, res) => res.send('Sample response for /timezone'));

api.get('/all_timezones', (req, res) => res.send('Sample response for /all_timezones'));

module.exports = api;
```

V1並沒有出現在路由中。為了在你的app中使用這個router，你需要創建一個完整的應用程序然後在你的主app代碼中使用router：

```

const app = require('express')();

// 引入router
const apiVersion1 = require('./api1');

// 使用router
app.use('/v1', apiVersion1);

app.listen(3000, () => console.log('App started on port 3000'));
```

過了幾天後，你決定實現API的版本2：

```
const api = require('express').Router();

api.get('/timezone', (req, res) => res.send('API 2: super cool new response for /timezone'));

module.exports = api;
```

```

const app = require('express')();

// 引入router
const apiVersion1 = require('./api1');
const apiVersion2 = require('./api2');

// 使用router
app.use('/v1', apiVersion1);
app.use('/v2', apiVersion2);

app.listen(3000, () => console.log('App started on port 3000'));
```

## 設置HTTP狀態碼

狀態碼每個區間都有一個特定的主題。Steve Losh寫了一個很棒的推特從server視角來總結它們：

HTTP狀態區間概要：

1xx：繼續
2xx：幹的好
3xx：走開
4xx：你搞砸了
5xx：我搞砸了

@stevelosh, [https://twitter.com/stevelosh/status/372740571749572610](https://twitter.com/stevelosh/status/372740571749572610)

在規範中的狀態碼大約60種。HTTP允許定義你自己的狀態碼，但人們希望你遵循相應的規範。

維基百科有一個偉大的列表[https://en.wikipedia.org/wiki/List_of_HTTP_status_codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)，裡面包含所有標準的(以及一些非標準的)http相應狀態碼，但是也有一些涉及利用Express構建API的。接下來將會透過每個區間做解釋。

>**什麼是HTTP 2** 很多HTTP請求是HTTP 1.1請求，還有一些依然在使用1.0版本。HTTP 2是下一個版本的標準，它已經慢慢實現並在網上推廣。幸運的是，大部分的變化發生在較低的層次並且你需要應對它們。HTTP 2定義了一個新的狀態碼──421──但它對你的影響並不大。

但首先，你要如何在Express中定義HTTP狀態碼呢?

### 設置HTTP狀態碼

你想控制你獲得的狀態碼，Express給HTTP response對象添加了status方法。你所需要做的只是在調用它的時候傳入一個狀態碼然後它就會開始運作。

這個方法應該在請求處理時被調用：

```

// ...
res.status(404);
// ...

```

這個方法是可以鏈式調用的，所以你可以在它之後調用json：

```
res.status(404).json({error: "Resource not found!"});

// 它等價於
res.status(404);
res.json({error: "Resource not found!"});
```

Express擴展了Node的原生HTTP response對象。儘管當你在使用Express的時候，應當遵循Express的方式來做事情，但你可能看到過下面這種方式來設置狀態碼(用Node原生API)：

```
res.statusCode = 404;
```

### 100區間

官方在100區間只有兩個狀態碼：100(繼續)和101(切換協議)。你可能從來沒有自己處理過這些。如果你處理了，請查看規範或維基百科的清單。

### 200區間

Steve Losh將200區間總結為："幹得好。""HTTP規範在200區間定義了幾個狀態碼，但是它們中只有四個是常用的。"

#### 200：OK

Web中最常見的狀態碼。如果你發送的整個響應都是良好的，並且沒有任何的錯誤或者重定向(你將在300區間部份看到)

#### 201：CREATEED

狀態碼201跟200十分的類似，但是在使用案例上稍微有點不同。它通常用於請求創建一個資源(通常會POST或PUT一個請求)。它可能會創建一個博客、發送一條消息，或者上傳一張照片。如果創建成功且依竊良好，你會發送一個201狀態碼。

#### 202：ACCEPTED

202是201的變種。

Node和Express大部分是非同步的。有時你會在非同步陣列創建一個資源，但它不會馬上被創建。

如果你十分肯定請求是想要創建一個有效的資源(假設你已經檢查了數據的有效性)，但是你還沒有創建它，你可以發送一個202狀態碼。它有效的告訴了客戶端，這裡一切良好，但是還沒有創建資源。

#### 204：No Content

204是201的刪減版。當你創建了一個資源，你通常會發送一個201或者一個202消息。當你刪除一些東西，與其他情況相比你通常沒有任何東西做響應，因為它已經被刪除了。這個時候你通常發送一個204狀態碼。還有其他一些狀況。即當你不需要發送任何類型響應的時候，但是刪除是最常用的用例。

### 300區間

在300區間有一些狀態碼，但是你真正用到的只有其中的三個，並且它們都涉及重定向。

#### 301：MOVED PERMANENTLY

301意思是不要再訪問這個URL；使用別的URL。301響應會附帶一個名為Location的HTTP請求頭部，所以會知道下一個要去的地方是哪。

你可能已經在瀏覽網頁，並且已經被重定向 — — 發生這種情況可能是因為301狀態碼。這經常會在頁面移動的時候發生。

#### 303：SEE OTHER

303同樣是重定向，但它有點不同。就好比200是用於常規請求的，而201適用於請求資源已經被創建，301適用於常規請求的，而303適用於**請求一個資源已經被創建並且你想重定向到新的頁面**。

#### 307：TEMPORARY REDIRECT

還有最後一個重定向狀態碼：307。跟狀態碼301類似，你可能已經瀏覽網頁並且因為狀態碼307已經重定向。他們十分相似。它們十分相似，但是他們有一個重要的差別。301標示著不要再次訪問這個URL，使用別的URL；307標誌著僅僅是現在使用別的URL。這可能是用於**臨時維護一個URL**。

### 400區間

400區間十分的廣大，並且它通常意味著**請求失敗**。換句話說，**客戶端犯了一個錯誤**，**並且它不是Server錯誤**。這裡有很多不同的錯誤。

#### 401和403：UNAUTHORIZED和FORBIDDEN ERRORS

對於客戶端身份驗證失敗會有兩個不同錯誤：401(未授權)和403(禁止)。

一個401發生在用戶端未登錄的時候。一個403錯誤發生在用戶登陸了有效用戶，**但是他們並沒有被授權去做他們想要做的事情**。

#### 404：NOT FOUND

關於404錯誤有一件事讓我覺得有一點奇怪，就是你可以訪問一個正確的路由，但是它依然返回404錯誤。

#### 其他錯誤

你會碰上很多其他的客戶端錯誤，這要列舉出來實在太多，可用狀態碼清單[https://en.wikipedia.org/wiki/List_of_HTTP_status_codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)來尋找你需要的狀態碼。

當不確定應該使用什麼樣的客戶端錯誤狀態碼，發送一個400請求錯誤。它一般響應任何類型的請求錯誤。通常，它意味著請求有錯誤的輸入 — — 例如，**缺少參數**。雖然可能有一個狀態碼可以更好的描述這個客戶端錯誤，但400同樣可以用在這裡。

### 500區間

HTTP規範裡的最後一個是500區間，雖然在這個區間裡有幾個錯誤，最重要的一個就是500：內部服務錯誤。500錯誤是server的錯誤，它可以用於任何數量的原因，從連接中斷到資料庫錯誤。

理想情況下，你將永遠無法從客戶端引起500錯誤 — — 這意味著你的客戶端可能會導致你的server端錯誤。

如果你發現了一個錯誤，並且它確實是你的錯誤，然後你可以用一個500錯誤進行響應。跟餘下那些需要詳細描述的狀態碼不一樣，它通常更加含糊地說“內部伺服器錯誤”；這樣駭客就不知道你系統弱點位於什麼地方了。

## 總結

一個Express環境下的API是一個網路服務，它接收請求然後返回結構化數據(多數情況是JSON)。

構建Express API的基本原理涉及使用JSON和路由特性。

HTTP方法和他們如何聯繫到普通應用程序的動作。GET對應讀取、POST對應創建、PUT對應改變，以及DELETE對應刪除。

版本化你的API有助於提升兼容性。Express的router特性幫助你創建不同版本的API。

有很多的HTTP狀態碼。一個好的API會適當的使用這些狀態碼。