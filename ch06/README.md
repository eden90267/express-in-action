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

>POST對比PUT
>
>引用HTTP規範，"PUT方法已經被定義為，用一個完整的新個體來覆蓋資源，而且它不能重複使用作局部變化。""PATCH允許你部分覆蓋一個資源。PATCH在2010才被正式定義，所以它在HTTP的應用場景相對較新的"