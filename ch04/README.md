# chap04. 中間件

Express的4個主要特性：

- 中間件：請求只透過一個函數，而Express擁有一個中間件棧，及一個有效的函數數組。
- 路由：路由有點類似中間件，但是它的函數只有在你透過特定HTTP方法訪問特定URL的時候被調用。
- 擴展：Express為提高開發者的便利性，給request和response對象擴展了方法和屬性。
- 視圖：視圖允許你動態渲染HTML。它允許你動態的改變HTML並且用別的語言編寫HTML。

>**本章涵蓋**
>編寫中間件函數：一個帶有3個參數的函數
>編寫並使用中錯誤處理中間件：一個帶有4個參數的函數
>使用開源中間件函數，將像用Morgan來記錄日誌和用express.static來提供靜態文件

原生Node提供的非常簡單API：創建一個處理請求的函數，並將它傳入http.createServer。儘管這個API很簡單，但是你的請求處理函數會隨著app的擴張變得笨重。

Express用於緩解這些問題。解決這些問題的東西被稱為中間件。中間件允許你將這些請求處理函數分解為更小的模組。這些更小的函數只在同一時間處理一件事情。其中一個可能用於記錄所有到達你server的請求；其他的可能用於解析傳入請求的特殊值；其他的可能用於用戶認證。

理論上來說，中間件是Express最大的部分。

## 中間件和中間件棧

總而言之，web server**監聽請求**，**解析這些請求**，**並且發送響應**。Node運行時將在第一時間獲得這些請求，然後將他們從**原始字節流轉變為兩個JavaScript對象**以便你可以用於處理。一個request對象和一個response對象。當透過Node.js自身工作的時候，流程圖如：

![](http://i.imgur.com/vMI5YQ4.png)

這兩個對象將被傳到一個你寫的JavaScript函數中，你將解析req來查看用戶想要什麼，然後透過操作res來準備你要響應什麼。

當完成對響應的編寫，你將調用`res.end`。這是Node用於表明**響應已經全部完成並且準備好透過網路發送的一個信號**。Node運行時將看到你對resp對象做了什麼，並將它**轉變為另一個原始字節流**，然後透過互聯網將它發送給請求它的人。

在Node中，這兩個對象只經過了一個函數。但是在Express中，這兩個對象經過了一組被稱為中間件棧的函數。Express將從棧中的第一個函數開始，然後按須執行棧中的函數：

![](http://i.imgur.com/W3Tx5Mn.png)

每個棧中的函數都有三個參數。最前面的兩個是req和res。它們是Node帶來的，儘管Express給他們附加了一些方便特性。

每個函數第三個參數本身就是一個函數，按慣例我們稱它為next。當next被調用的時候，Express將繼續下一個棧中的函數。

![](http://i.imgur.com/YqPrFLW.png)

最後，這些棧中的函數在結束請求的時候必須調用`res.end`。(在Express中，你同樣可以調用類似`res.send`和`res.sendFile`這樣的別的方法，但它們內部同樣調用了`res.end`)你可以在任何中間棧的函數調用`res.end`，但是要馬你只能執行一次，要馬你會得到一個錯誤。

來看一個搭建靜態文件server的例子

## 示例app：一個靜態文件server

讓我們搭建一個簡單的小型應用程序用於從一個文件夾中提供文件，你可在文件夾中放置任何東西，然後它將被用於提高服務。

這個Express應用程序透過三個中間件函數組成：

- 日誌紀錄器──他將用於在控制台輸出請求URL以及它被訪問的時間。它總是繼續下一個中間件。
- 靜態文件發送器──它將檢查文件是否存在文件夾中。如果存在，他將透過網路發送這個文件。如果請求的文件不存在，他將繼續到最後一個中間件(再說一次，調用next)。
- 404處理器──如果這個中間件被調用，這就意味著前面並沒有找到文件，你應該返回一個404消息並結束本次請求。

![](http://i.imgur.com/XhSOjsg.png)

讓我們開始構建這些東西吧。

### 起步

*statucfuke-fun*專案：

```
{
  "name": "staticfile-fun",
  "private": true, // 告訴Node不將它發佈到公開模組倉庫
  "scripts": {
    "start": "node app"
  },
  "dependencies": {
    "express": "^4.15.3"
  }
}
```

再來是創建一個static的文件夾。裡面放一些文件。

創建app.js。

>**為什麼要使用npm start?**
>為什麼要用npm啟動，為什麼不運行node app.js替代它？這麼做可能有三個原因。
>這是一個約定。很多的Node web伺服器可以透過npm start來起動，而不需擔心項目的結構。如果有人使用application.js來取代app.js，你必須知道這些變化。Node社區似乎透過一個共同的約定解決了這個問題。
>它允許你用一個簡單的命令去運行複雜的命令(或一組命令)。假設你已經需要啟動一個資料庫服務或清除一個巨大的日誌文件。保持這種負責的指令遮蓋在一個簡單的命令之下，可以幫你在保持結果不變的同時讓你的心情更加愉悅。
>第三個原因有一點微妙。npm允許你在全局安裝包，所以你可以像其他的終端命令一樣運行它們。Bower是常見的一個，利用bower命令可以讓你從命令行安裝前端依賴項。你在系統中安裝像全局Bower這樣的東西。npm script允許你在沒有全局安裝他們的情況下給你的項目添加新的指令，所以你可以保持所有你項目裡的依賴項，讓你的每一個項目有獨立的版本。就像你看到的那樣，它帶來了像測試和構建腳本這樣方便的東西。

### 編寫你的第一個中間件函數：日誌紀錄器

*app.js*：

```
var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.use(function (req, res, next) {
    console.log('Request IP：' + req.url);
    console.log('Request date：' + new Date());
    next(); // 這行很重要
});

app.listen(3000, function () {
    console.log('App started on port 3000');
});
```

```
npm start
```

>**厭倦了啟動服務器？**
>可透過運行node-mon來監測文件自動重啟能力。`node-mon app.js`

### 靜態文件服務中間件

靜態文件服務中間件應該做這幾件事情：

1. 檢查請求的文件是否存在於目錄中
2. 如果文件存在，響應這個文件並結束其餘工作。從代碼角度來說，它調用了`res.sendFile`。
3. 如果文件不存在，繼續下一個中間件棧中的中間件。從代碼的角度來說，它調用了`next()`。

讓我們將需求用代碼實現：

```
// ...

app.use(function (req, res, next) {
    var filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            return next();
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath);
        } else {
            // 不存在則調用下一個中間件
            next();
        }
    });
});

app.listen(3000, function () {
    // ...
```

如果用戶訪問/celine.mp3，req.url的值將是字符串"/celine.mp3"，因此，filePath的值將會類似："/path/to/your/project/static/celine.mp3"。

`fs.stat`，它將攜帶兩個參數。第一個是需要檢查的路徑(filePath)，第二個是一個函數。當Node找到了這個文件的信息，它將調用帶有兩個參數的回調函數。這個回調函數的第一個參數是一個錯誤信息，以防出錯。第二個參數是一個有很多文件相關函數的對象，例如isDirectory()或isFile()。我們用isFile()來確定文件是否存在。

Express應用程序的非同步特性，你需要手動告訴Express什麼時候繼續棧中的下一個中間件。這也就是為什麼要使用next的原因！

現在來添加最後一個——404處理中間件

### 404處理中間件

```
// ...

// 我們去掉了參數next，因為你用不到它
app.use(function (req, res) {
    // 設置狀態碼為404
    res.status(404);
    // 發送錯誤提示
    res.send('File not found!');
});

// ...
```

但是跟往常一樣，你還有很多事情可以做。

### 把你的日誌記錄器替換為開源的日誌記錄器：Morgan

Morgan不是Express內置的，但它是Express團隊維護的。

Morgan的自我描述是"請求紀錄器中間件"，這正是你想要的東西。

```
npm install morgan --save
```

*app.js*：

```
var morgan = require('morgan');

// ...

var app = express();

app.use(morgan('short'));

// ...
```

morgan中間件類似你之前寫的函數；它傳入三個參數並調用console.log。很多第三方中間件透過這種方式工作──你透過調用一個你要用的函數返回中間件。

注意到你調用了Morgan並給其傳入一個參數：一個字符串"short"。這是一個Morgan特有的配置選項，它用於指定輸出是什麼樣子。還有其他格式字符串配置或多或少的信息："combined"獲取大量的信息；"tiny"獲取最小的輸出。當你透過不同的配置選項調用Morgan，你可以高效的使它返回不同的中間件函數。

再來你將使用其他的中間件來替換你自己的第二個中間件：靜態文件服務。

### 替換為Express的內置靜態文件中間件

只有一個中間件是Express內置的，我們將用它來替換掉你的第二個中間件

它就是`express.static`。它的工作原理跟我們自己寫的中間件相似，但是它有一堆其它的特性。它透過一些複雜的技巧得到更好的安全性和性能，例如添加一個緩存機制。

`express.static`也是一個返回中間件的函數。它傳入一個參數：你想要提供靜態文件的文件夾目錄。為了拿到這個路徑，你將使用`path.join`就像之前一樣。接著傳入到這個靜態文件中間件：

```
var staticPath = path.join(__dirname, 'static');
app.use(express.static(staticPath)); // 使用express.static從靜態路徑提供服務
```

它有點複雜，因為它的特性實在太多了，但是`express.static`跟你之前的代碼很相似。如果文件存在路徑中，它將被發送。如果文件不存在，它將調用next然後繼續棧中的下一個中間件。

## 錯誤處理中間件

調用next的時候會繼續到下一個中間件?

這裡有兩種類型的中間件。到目前為止你已經接觸到第一種類型──傳入三個參數的常規中間件函數(當next被忽略的時候只會傳入兩個)。絕大多數的時候，你的app使用常規的模式，這樣看起來就像是只有這種中間件函數，而把另一種忽略了。

第二種方式十分的少用：錯誤處理中間件。當你的app處於錯誤模式的時候，所有的常規中間件將會被忽視，接著Express將會執行錯誤處理中間件函數。想要進入錯誤模式，只需簡單的附帶一個如

```
next(new Error('Something bad happened!'))
```

這些中間件函數接收四個參數而不是兩個或三個。第一個是一個錯誤(這個參數會傳入next中)，其餘的三個跟之前一樣：req、res和next。你可以做一些你想在中間件中做的事情。當你完成之後，它看起來就像是其他中間件一樣：你調用res.end或者next。不帶參數調用next將會退出錯誤模式，然後移動到下一個常規的中間件；如果帶參數調用它將會移動到下一個錯誤處理中間件，如果還有錯誤處理中間件的話。

以下是四個中間件，如果沒有錯誤發生：

![](http://i.imgur.com/szgCi2V.png)

沒有錯誤發生，錯誤中間件就像是從來都沒存在過一樣。再說準確點"沒有錯誤"意味著"next從來沒有被帶參數調用過"。

如果發生一個錯誤，Express將跳過棧中所有錯誤中間件之前的其他中間件：

![](http://i.imgur.com/knrWDsm.png)

錯誤處理中間件通常放置在你中間件棧的底部，畢竟常規中間件已經添加好了。這是因為你想在棧的較早時候捕獲級聯的錯誤。

>**這裡沒有捕捉異常**
>Express的錯誤處理中間件並沒有用throw關鍵字拋出錯誤來進行處理，而是透過你帶參數調用next進行處理。
>Express有一些異常保護措施。app將返回一個500錯誤並且請求失敗，但是這個app將保持運行。然而，一些語法錯誤這樣的問題將會使你的server崩潰。

一個總是發送文件的小應用：

```
var express = require('express');
var path = require('path');

var app = express();

var filePath = path.join(__dirname, 'celine.jpg');
app.use(function (req, res) {
    res.sendFile(filePath);
});

app.listen(3000, function () {
    console.log('App started on port 3000');
});
```

如果這個文件不存在你的電腦中呢? 如果在讀取這個文件的時候出問題呢? 你想要一些處理這個錯誤的方法，錯誤處理中間件來拯救你了。

為了進入錯誤模式，你將透過res.sendFile的一個便捷特性：它可以攜帶一個外部參數，作為回調函數。這個回調函數將在文件發送之後執行，如果在發送的時候有錯誤，它將傳入一個參數。如果你想要打印它是否成功，你需要做一些事情：

```
res.sendFile(filePath, (err) => {
    if (err) {
        console.log('File failed to send.');
    } else {
        console.log('File sent!');
    }
});
```

如果出現錯誤的話，你可透過帶參數調用next進入錯誤模式，用於取代透過控制台打印成功歷史。

```
app.use((req, res, next) => {
    res.sendFile(filePath, (err) => {
        if (err) {
            next(new Error('Error sending file!'));
        }
    });
});
```

現在你進入了錯誤模式，你可以操作它了。

但會將JavaScript棧追蹤整個呈現給用戶，會讓用戶困惑，也可能讓駭客有機可趁。

我們編寫簡單的中間件用於紀錄錯誤但不對錯誤進行響應。

```
// 記錄所有錯誤的中間件
app.use((err, req, res, next) => {
    console.error(err);
    next(err);
});
```

但它沒響應請求，讓我們編寫這部分：

```
// 相應錯誤
app.use((err, req, res, next) => { // 確保你指定了四個參數
    res.status(500);
    res.send('Internal server error.');
});
```

Express透過函數的參數數量來判定中間件是否用於處理錯誤。

## 其他有用的中間件

只有一個中間件是Express附帶的，它就是express.static。透過本書你將安裝並使用大量的中間件。

Express團隊還維護著一些中間件模組，儘管這些模組不是Express附帶的：

- **body-parser**：用於請解析請求body。例如，當一個用戶提交了一個表單。
- **cookie-parser**：用於解析用戶的cookie。它需要配合Express的另外一個中間件使用，例如**express-session**。一旦你做了這些，你可以追逐用戶，向他們提供帳戶和其他的信息。
- c**ompression**：用於壓縮響應來節省字節。

你可在Express的主頁找到所有的中間件列表，有大量第三方中間件模組等著我們去研究。有兩個名字：

- **Helmet**：用於提高你應用程序的安全性。它不會神奇的讓你應用程序更安全，但是少量的工作就可以讓你防止大量的駭客。
- **connect-assets**：將你的CSS和JavaScript進行合併，壓縮。它同樣用於CSS預處理器，例如：SASS、SCSS、LESS和Stylus。

## 總結

Express應用程序有一個中間件棧。當一個請求傳入你的應用程序，請求從上到下透過這個中間件棧，除非它們被響應或者遇到一個錯誤。

中間件是由請求處理函數組成的。這些函數同時傳入兩個參數：request、response。它們通常傳入一個函數用於指定它們如何繼續到棧中的下一個中間件。

有大量的第三方中間件給你使用，很多是由Express開發者維護。