# chap02. Node.js基礎

Node.js被這樣介紹：基於JavaScript的，非同步的並且擁有大量的第三方模組。

## 安裝Node

JavaScript世界的一個主題是壓倒性數量的選擇。

如果你使用的是Mac或Linux，極力推薦

- [Node版本管理器(MVN)](https://github.com/creationix/nvm)。
- [MVMW](https://github.com/hakobera/nvmw)是提供給Windows用戶使用。

如果想獲取穩定版本的Node和實驗性的預先發行版本，工具可讓你輕鬆的在Node版本之間切換。它同樣允許你在新版本發布的時候輕鬆的更新Node。NVM卸載方便，同時不需要administrator(root)權限在你的系統上進行安裝。

### 運行第一個Node腳本

```
// 代码清单 2.1 helloworld.js

console.log("Hello, world!");
```

可透過`node helloworld`來運行。

## 使用模組

大多數的編程語言都有一種**文件包含方式**，將A代碼文件包含到B文件之中，所以你可將代碼拆分多個文件。

很長一段時間內，JavaScript語言並沒有一種官方的方式來解決這個問題。為了解決這問題，有人製作了例如RequireJS這樣的，用於在JavaScript文件中載入別的依賴關係文件的工具。很多web開發者只需填寫`<script>`標籤。

Node想要優雅解決這個問題，開發者實現的這個模塊系統稱為CommonJS。透過它的核心，CommonJS讓你可以從別的文件中引入代碼。

在這模組系統中有三個重要的部分：引入內置模組，引入第三方模組，以及製作你自己的模組。

### 引入內置模組

Node有很多的內置模組，從被稱為**fs**的文件系統訪問模組，再到被稱為**util**的工具函數內置模組。

Node擁有內置的URL解析模塊，它公開了一些方法，最引人注目的是一個叫做parse的方法。它從一個URL字符串中提取出有用的信息，像域名或者路徑。

你將利用Node的require功能去使用一個url模組。require類似別的語言中的import或include關鍵字。require接收一個包名字符串參數並返回一個包。返回的對象沒什麼特別，它通常是一個對象，但它可以是一個函數或者字符串或者一個數字。

以下代碼是如何使用url模塊：

```
var url = require('url');
var parsedURL = url.parse('http://www.example.com/rofile?name=barry'); // 使用url模組的parse函數

console.log(parsedURL.protocol); // "http:"
console.log(parsedURL.host); // "www.example.com"
console.log(parsedURL.query); // "name=barry"
```

`require('url')`返回了一個帶有parse方法的對象。然後你可以像其他對象一樣使用它了。

絕大多數的時候，當你去請求一個模組，你往往把它存入一個跟模組名字相同的變量中。

### 透過package.json和npm引入一個第三方模組

第三方包是編寫應用程序必不可少的。

任何Node項目都存放在一個文件夾中，並且在所有Node項目根目錄都會有一個package.json的文件(第三方包)。

"package點json"是一個相當簡單的JSON文件，它用來定義項目的元數據，例如項目的名字，它的版本，以及它的作者。它同樣定義了項目的依賴關係信息。

```
{
  "name": "my-fun-project",
  "author": "eden90267",
  "private": true,
  "version": "0.2.0",
  "dependencies": {
  }
}
```

當你安裝Node，實際上你安裝了兩個程序：Node以及npm。npm是一個官方的用於構建Node項目的輔助工具。

npm通常被稱為"Node包管理器"，它不是明確的縮寫。npm做的事比"包管理器"要更多。

假設你要使用[Mustache](https://mustache.github.io/)，一個小型的模板系統，它可讓你把模板字符串轉變為真實的字符串：

```
var Mustache = require('mustache');

Mustache.render('Hello, {{first}} {{last}}!', {
    first: 'Nicolas',
    last: 'Cage'
});

Mustache.render('Hello, {{first}} {{last}}', {
    first: 'Sheryl',
    last: 'Sandberg'
});
```

在根目錄，運行`npm install mustache --save`。這命令創建了node_modules文件夾。並將最新版本的mustache包放置到node_modules文件夾中。這個`--save`標記將它添加到package.json中。這樣做的好處是交給別人可安裝依賴關係，他們只需要執行`npm install`。Node項目不攜帶依賴文件本身(node_modules)。

```
var Mustache = require('mustache');

var result = Mustache.render('Hi, {{first}} {{last}}', {
    first: 'Nicolas',
    last: 'Cage'
});

console.log(result);
```

>`npm init`
>npm不僅僅是安裝依賴關係。例如，它允許你自動生成package.json文件。

### 定義你自己的模組

random-integer.js：

```
var MAX = 100;

function randomInteger() {
    return Math.floor(Math.random() * MAX);
}
```

在Node中，你不能把它保存到一個文件然後收工；你需要選擇一個需要公開的變數，從而當別的文件require它的時候，它們能夠知道該獲取什麼。就像接下來的展示：

```
var MAX = 100;

function randomInteger() {
    return Math.floor(Math.random() * MAX);
}

module.exports = randomInteger; // 公開模塊給其他文件
```

>記住module.exports可以是任何你想要的東西。任何你可以用一個變數聲明的東西都可以分配給module.exports。

print-three-random-integers.js：

```
var randomInt = require('./random-integer'); // 一個相對路徑
console.log(randomInt()); // 7
console.log(randomInt()); // 69
console.log(randomInt()); // 51
```

你可以像別的模組一樣引入它了，但是你必須透過點語法來指定它的路徑。除此之外，這幾乎一模一樣。

>如果對發布一個可供任何人使用的模組感興趣，可查看[這裡](http://evanhahn.com/make-an-npm-baby/)。

## Node：一個異步的世界

以"我們烤鬆餅"來做類比。製作鬆餅準備麵糊，就不能做其他實質性的事情：我不能看書，不能準備更多的麵糊。但我將鬆餅放入烤爐，我就可以做別的事情了。

這裡有一個要點是，我從來沒有同時做兩件事情。即使多件事情在同一時候發生(當鬆餅在烤的時候我正在跑步)，我在同一個時刻只做一件事情，這是因為烤箱不是我自己，它是一個外部資源。

![](http://i.imgur.com/DHmJKJp.png)

Node的非同步模型工作原理也是類似的。一個瀏覽器可以從你的Node伺服器請求一個100MB的小貓圖片。你開始從硬碟加載這個很大的照片。這個硬碟是一個外部資源，所以你向它請求這個文件，接著當你在等待它加載的時候可以去做別的事情。

當你在加載這個文件的時候，第二個請求隨之而來。你不需要等待第一個請求結束──當你在等待硬碟當前工作結束的時候，你可以開始解析第二個請求。再提一下，Node從來不會在同一時刻去做兩件事情，但是當一個外部資源在工作的時候，你可以不用掛起等待。

兩種你在Express中要應對的外部資源。

- 任何涉及到文件系統的──例如從你的硬碟讀寫文件
- 任何設計網路的──例如接收一個請求，發送一個回應，再或透過網路發送你自己的請求

概念上就這麼多。

在代碼中，這些被非同步處理的事情稱為回呼。就像你曾經在一個web頁面中做的AJAX請求一樣；你發送一個請求並傳遞一個回呼。當瀏覽器完成你的請求。它將調用你的回呼。Node的工作方式相同。

讀取一個*myfile.txt*文件後，將文件中字母X出現的次數打印出來：

```
var fs = require('fs');
var options = {encoding: 'utf-8'};

fs.readFile('myfile.txt', options, function (err, data) {
    if (err) return console.log('Error reading file!');

    // 透過正則表達式打印X的個數
    console.log(data.match(/x/gi).length + " letter X's");
});
```

當這個文件已經從磁盤上讀取，Node將跳轉到你的回呼中。

在Node中很多回呼把錯誤訊息(error)作為它們的第一個參數。如果一切正常，參數err將被設為null，如果有問題，err會被賦值。這是處理這些問題的最佳實踐。有時，錯誤不會完完全全停止你的程序，並且你可以繼續運行，但是你時常要處理這些錯誤，然後透過拋出一個錯誤或者直接return來脫離回呼。這是Node的常見作法，並且你幾乎看到到處都是回呼。

現在底部增加一個`console.log`語句：

```
var fs = require('fs');
var options = {encoding: 'utf-8'};

fs.readFile('myfile.txt', options, function (err, data) {
    if (err) return console.log('Error reading file!');

    // 透過正則表達式打印X的個數
    console.log(data.match(/x/gi).length + " letter X's");
});

console.log("Hello world!");
```

因讀取文件採用的是非同步方式，你將看到文件結果之前先看到"Hello World!"。造成這樣是因為外部資源──文件系統──還沒有返回給你。

這就是Node非同步模型超級有用的原因。當一個外部資源在處理事情的時候，你可以繼續運行別的代碼。在web應用程序的環境中，這意味著你可以在同一時間解析更多的請求。

## 用Node建立一個web server：http模組

http內置模組對Express十分重要。這個模組使得你用Node開發web成為可能，Express是基於它的。

Node的http模組擁有很多的特性(比如，向其他server提出請求)不過我們將使用它的HTTP服務組件：一個叫做`http.createServer`的函數。這個函數需要一個回呼，它會在**每次請求到來的時候調用**，並且**返回一個server對象**。

*myserver.js*：

```
var http = require('http');

// 定義一個函數用來處理即將到來的HTTP請求
function requestHandler(req, res) {
    console.log('In comes a request to: ' + req.url);
    res.end('Hello, world!');
}

var server = http.createServer(requestHandler); // 創建一個server，並用你的函數去處理請求

server.listen(3000); // 啟動server並監聽3000端口
```

請求處理函數接收兩個參數：request對象還有response對象。request對象有一些項目，如瀏覽器請求URL(他們是否訪問了主頁或者關於頁)，或是瀏覽頁面的瀏覽器類型(被稱為user-agent)，再或者其他類似的項。你可在response對象上調用方法或者Node將打包字節並將他們透過網絡發送。

注意請求URL並不包含“localhost:3000”。這可能有點不直觀，但是其實這是十分有用的。它允許你在任何地方部署你的應用，從你的本地server到你最喜歡的.com地址。它的工作將沒有任何變化。

你可想像解析請求URL。你可能會做一些事情正如接下來的代碼清單。

```
// 透過一個請求處理函數解析請求URL
function requestHandler(req, res) {
    if (req.url === '/') {
        res.end('Welcome to the homepage!');
    } else if (req.url === '/about') {
        res.end('Welcome to the about page!');
    } else {
        res.end('Error! File not found');
    }
}
```

你可想像用這一個請求處理函數來構建你的整個站點。對於很小的站點，這可能很簡單，但你可以看到這個函數很快會變得巨大並且笨重。你可能想要一個框架來幫助你清理HTTP Server —— 這就是Express出現的原因。

## 總結

安裝Node。建議使用版本管理器。可輕鬆切換版本並按須更新。

Node模組系統利用一個叫`require`的全局函數和一個叫做`module.exports`的全局對象。他們兩個組成了簡單的模組系統。

你可使用npm從npm倉庫安裝第三包。

Node有事件I/O。這就意味著當一個事件發生(比如傳入web請求)，一個函數(或函數集)被調用。

Node有一個內置模組http。它對構建web應用程序很有用。