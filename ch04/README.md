# chap04. 中間件

...(待補)

## 起步

staticfuke-fun專案：

```
{
  "name": "staticfile-fun",
  "private": true,
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