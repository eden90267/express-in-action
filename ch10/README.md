# chap10. 安全性

>**本章涵蓋**  
>使用工具和測試讓你的Express代碼保持bug-free  
>處理攻擊：了解它們如何工作以及如何防止它們  
>處理不可避免的Server崩壞  
>審核第三方代碼

## 安全體系

著名安全專家Bruce Schneier是這樣描述安全體系的：

>Uncle Milton公司從1965年開始給孩子們出售螞蟻農場，記得多年前我和朋友打開過一個。盒子中並沒有螞蟻。取而代之的是一張填寫著你地址的卡片，之後公司將會給你郵寄一些螞蟻。我的朋友對可以從郵件中拿到螞蟻感到很驚訝。  
>我回答到：“真正有趣的事情是，你可以讓他們把一管螞蟻送給任何你指定的人。”  
>需要一個特殊的體系來保證安全。信息安全專家——至少是好的——看到了不同的世界。他們不會進入一個不能注意到偷竊行為的商店。他們不能使用一台沒有奇怪漏洞的電腦。他們不會在弄清楚如何兩次投票之前進行投票。它們只是情不自禁而已。  
>Bruce Schneier的“安全體系”，見[https://www.schneier.com/blog/archives/2008/03/the_security_mi_1.html](https://www.schneier.com/blog/archives/2008/03/the_security_mi_1.html)。

Bruce Schneier並不提倡你去偷東西和違法。它提出把自己想像成一個攻擊者是保護自己的最好方式——別人如何去破壞一個系統？別人會怎麼濫用他們權限？如果你從一個攻擊者的角度思考並找出你代碼中的漏洞，然後你就可以知道如何修復這些漏洞並使你的應用程序更加的安全。

這章會介紹常見的那些：

## 使你的程序盡量達到bug-free

你必須採取措施來防止bug的出現。很多bug造成安全漏洞是不足為奇的。

有很多方法可以讓你的Express應用程序bug-free，從而降低被攻擊的機率。在本部分，並不會涵蓋使你軟件bug-free的一般原則，不過有幾點是你需要牢記於心的：

- 測試十分重要
- 代碼審查十分有用。更多關注代碼意味著會有更少bug
- 不要重複造輪子。如果有人已經編寫了一個你需要用到的庫，你應該盡可能的使用這個庫，不過要確保它是被全面檢測過並且是可靠的
- 保持良好的編碼習慣。我們將重溫Express和Javascript的細節問題，不過你應該確保你代碼簡潔並有著良好的架構

我們將在本部分討論Express的細節，不過提及到的原則可以有效地幫助你防止bug，從而防止安全問題。

### 利用JSHint約束JavaScript

《The Good Parts》（O’Reilly Media, 2008），一本出自Douglas Grockford的著名書籍：它把Javascript中好的部分開闢了一個子集，並把其餘的部分唾棄掉。

例如，Crockford不提倡使用雙等號操作符(==)，並提倡使用三等號操作符(===)。雙等號操作符會進行類型轉換，它會使你的程序變得複雜並為你帶來bug，反之三等號操作符的工作基本符合你的預期。

此外，許多陷阱通常是JavaScript開發者自身造成。缺少分號、忘記`var`聲明、變數名拼寫錯誤。

[JSHint](http://jshint.com/)：強制良好代碼風格的工具，以及一個可以幫助你修復錯誤的工具。

JSHint查看你的代碼並指出它認為可疑的調用。使用雙等號操作符或是遺漏var。

你利用`npm install jshint -g`進行全局安裝。然後，輸入：`jshint myfile.js`，JSHint將會檢查你的代碼並警告你一些可疑的使用或bug：

*myfile.js*：

```
function square(n) {
    var result n * n
    return result;
}
square(5);
```

jshint結果：

```
$ jshint myfile.js    
myfile.js: line 2, col 15, Missing semicolon.
myfile.js: line 2, col 20, Expected an assignment or function call and instead saw an expression.
myfile.js: line 2, col 21, Missing semicolon.

3 errors
```

如果你看到這些，你就會知道哪裡出錯了！

將JSHint集成到編輯器是最好的選擇。訪問JSHint下載頁面[http://jshint.com/install/](http://jshint.com/install/)查看集成編輯器的列表。

JSHint為我在使用Javascript的時候節省了了大量的時間，並且修復了數不清的錯誤。讓我知道了其中一些bug會存在安全漏洞。

### 當回調函數遇到錯誤時停止

回調函數是Node中十分重要的組成部分。Express裡的每個中間件和路由都會使用到它們，且是幾乎一切！很不幸，人們在回調函數中的一些錯誤就可以導致bug的產生。

看看你能否在這段代碼中發現錯誤：

```
fs.readFile('myfile.txt', function(err, data) {
    if (err) {
        console.error(err);
    }
    console.log(data);
});
```

它處於一些原因沒有工作的話，你將輸出錯誤然後繼續嘗試輸出文件內容。

如果這裡出現一個錯誤，你應該停止執行。

```
fs.readFile('myfile.txt', (err, data) => {
    if (err) {
        console.error(err);
        throw err;
    }
    console.log(data);
});
```

在遇到任何類型錯誤的時候停止執行是很重要的。你並不想應對錯誤的結果——它會導致你的Server出現錯誤行為。

## 危險的查詢字符串解析

幾乎妳使用過的所有搜尋引擎都使用了某種類型的查詢字符串。

如果你搜索crockford backflip video將會是這樣：

```
http://mysearchengine.com/search?q=crockford+backflip+video
```

在Express中，你可以用`req.query`獲取查詢字符串：

```
app.get('/search', (req, res) => {
    // 包含字符串“crockford backflip video”
    let search = req.query.q.replace(/\+/g, " ");
    // ...
});
```

如果用戶不攜帶查詢參數q訪問/search路由，之後你調用.replace的時候將會導致undefined variable錯誤！

你總期望你用戶會按照你的預期提供資料，如果他們不這麼做的話，你就需要做點什麼了。最簡單的方式就像是提供一個預設值。

```
app.get('/search', (req, res) => {
    let search = req.query.q || '';
    let terms = search.split('+');
    // ...
});
```

它修復了一個重要的bug：如果你查詢了一個不存在的值，你也不用擔心變數會是undefined。

不過在用Express解析查詢字串的時候還有另一個問題：他們同樣可以輸入錯誤的類型

如果用戶訪問的是/search?q=abc，那麼req.query.q依然會是字符串。在訪問/search?q=abc&name=douglas的時候同樣回是字符串。不過，如果把同一個q變數指定兩次：

```
/search?q=abc&q=xyz
```

那麼req.query.q將會變成陣列['abc', 'xyz']。現在，如果你調用了.replace，它會因為陣列沒有定義這個方法而再次出錯。

這是Express設計的瑕疵。你需要假設你的查詢字符串可能會是一個陣列。

為了解決這個問題。作者寫了arraywrap包([https://www.npmjs.com/package/arraywrap](https://www.npmjs.com/package/arraywrap))。這是一個小型模組；它總共只有19行代碼。這個函數需要傳遞一個參數。如果這個參數之前並不是陣列，那麼他就會被包裝為一個陣列。如果參數是一個陣列，它依然會返回一個陣列，因為它本身就已經是一個陣列了。

你可利用npm i arraywrap --save安裝它，之後你就可以用它來將你所有的查詢字符串強制轉換為陣列：

```
const arrayWrap = require('arraywrap');

// ...

app.get('/search', (req, res) => {
    let search = arrayWrap(req.query.q || '');
    let terms = search[0].split('+');
    // ...
});
```

現在，如果有人向你提供很多符合預期的查詢，你只會獲取第一個並忽略其餘的部分。如果有人給你提供的是一個查詢參數或者沒有提供查詢參數它依然可以正常工作。或者，你也可在發現查詢不是陣列的時候做一些別的事情。

這引出一個重點：永遠不要信任用戶的輸入。假設每個路由都將會被某種方式破壞掉。

## 保護你的用戶

每個沒有對敏感資料進行處理的產品都可能造成密碼洩漏——Sony和Adobe就被曝光過這種醜聞。如果你的網站擁有用戶，那麼你有責任去保護他們。你可以做幾件事情來保護你的用戶免受危害。

### 使用HTTPS

它可以幫助你的用戶免受很多類型的攻擊。相信我——你需要它！

有兩個Express中間件會在你想要使用HTTPS的時候用到。其中一個會強制你的用戶使用HTTPS而另一個則會幫助它們持續使用HTTPS。

#### 強制用戶使用HTTPS

express-enforces-ssl。顧名思義，它強制使用SSL(HTTPS)。基本上，如果請求是基於HTTPS的，它會傳遞到其餘的中間件和路由。如果不是，它將會重定向到HTTPS的版本。

使用這模塊的時候，我們需要做兩件事情：

1. 啟用“信任代理”設置。絕大多數時候，當你在部署應用程序的時候，你的server並不會直接連接到客戶端。如果部署到Heroku雲平台，Heroku server位於你和客戶端之間。為了把這些告知Express，你需要啟用“信任代理”設置。
2. 調用中間件

確保你已經npm i express-enforces-ssl --save，然後運行如下代碼清單：

```
const enforceSSL = require('express-enforces-ssl');
// ...
app.enable('trust proxy');
app.use(enforceSSL());
```

想知道更多可以查看：[https://github.com/aredo/express-enforces-ssl](https://github.com/aredo/express-enforces-ssl)。

#### 幫助用戶持續使用HTTPS

一旦你的用戶使用的是HTTPS，你將需要告知它們要避免回退到HTTP。現代瀏覽器支持HTTP Strict Transport Security(HSTS)特性。這是一個簡單的HTTP頭部。它用於**告訴browser持續使用HTTPS一段時間**。

如果你想讓你的用戶持續使用HTTPS一年(約31536000秒)，你應該設置如下：

```
Strict-Transport-Security: max=age=31536000
```

你同樣可以啟用對二級域名的支持。如果你擁有slime.biz這個域名，你可能會想在cool.slime.biz啟用HSTS。

為了設置這個頭部，你將用到Helmet([https://github.com/helmetjs/helmet](https://github.com/helmetjs/helmet))，這是一個**用在Express中設置HTTP安全頭部的模組**。它有多種標題可以設置，我們將從HSTS功能開始。

`npm i helmet --save`。我同樣建議你總是安裝ms模組，它可以將human可讀字符串(例如“2 days”)轉換為172, 800, 000毫秒。現在你可以像下面清單這樣使用這個中間件：

```
const helmet = require('helmet');
const ms = require('ms');
// ...
app.use(helmet.hsts({
    maxAge: ms("1 year"),
    includeSubdomains: true,
}));
```

現在，HSTS將會被設置到每個請求中。

>**為什麼我不能單獨使用HSTS？** 這個頭部只有在用戶已經是HTTPS的時候才會生效，這就是為什麼你需要`express-enforces-ssl`的原因。

### 防止跨站腳本攻擊

如何控制瀏覽器？ 假設利用跨站腳本(XSS)攻擊是最流行的方法。

假設在銀行主頁，我可以看到一個由我的聯繫方式和名字組成的列表：

![](http://i.imgur.com/DFiUU5x.png)

用戶可以控制他們的名字，Bruce Lee可以進入他的設置頁面，並將他的名字改為這樣：

```
Bruce Lee<script>transferMoney(1000000, "bruce-lee’s-account");</script>
```

聯繫人外觀依然沒有改變，不過現在我的web瀏覽器同樣會執行`<script>`標籤內部的代碼！Bruce Lee同樣可以把`<script src="http://brucelee.biz/hacker.js"></script>`添加到他的名字。這段腳本可以給brucelee.biz發送資料(例如登陸信息)。

防止XSS總的方式就是：永遠不要盲目的相信用戶的輸入。

#### 轉碼用戶輸入

當你獲取到用戶輸入的時候，它們總是可能輸入一些惡意信息。前面例子中，你可以在你的名字中包含`<script>`標籤，從而導致了XSS問題。你可審核或轉碼用戶的輸入，因此，當你將他放置到你HTML的時候，你不會遇到任何意外結果。

取決於用戶的輸入，你將以不同的方式檢查它們。就一般原則來說，你會盡可能的檢查它們，並且總是記住上下文。

如果你在用戶內容中放置了HTML標籤，但你想要保證其中不會定義任何的HTML標籤。例如，你想要這樣一串字符串：

```
Hello, <script src="http://evil.com/hack.js"></script>world.
```

變成這樣子：

```
Hello, &lt;script src="http://evil.com/hack.js"&gt;&lt;/script&gt;world.
```

透過這種方法，`<script>`標籤將會作廢。

這種類型的轉碼(更多的)是由大多數的模板引擎為你處理的。在EJS中，會默認在`<%= myString %>`中使用以及在`<%- userString %>`中不使用。在Pug中，默認進行轉碼設置。除非你確定不想進行審查，否則，只要在你處理用戶字符串的時候就要確保使用安全的版本。

如果你知道用戶應該輸入的是一個URL，你要做的就不只是轉碼了；你需要盡可能從各方面驗證它是URL。你同樣想要在URL上調用內置的`encodeURI`函數從而確保它是安全的。



如果你把一些東西放置到HTML屬性中(例如a連接的href屬性)，你會想要確保用戶不能插入引號。很不幸，並不存在一個可以審查所有用戶輸入的通用解決方案；審查方案是視內容而定。不過你總是應該盡可能地審查用戶輸入。

你同樣可在你每次將它存入資料庫之前進行轉碼。在我們剛剛用過的例子中，我們展示了如何在任何需要展示信息的時候審查它們。但如果你知道用戶應該在他們的個人信息中導入主頁，這同樣有助於你在存入資料庫之前對它進行審查。如果我錄入"hello, world"作為我的主頁，Server應該得到一個錯誤。如果我錄入http://evanhahn.com/作為我的主頁，這應該被允許放入到資料庫中。這樣可以獲得安全收益和UI收益。

#### 利用HTTP頭部緩解XSS問題

有另一種方式用來緩解XSS問題。這個方式十分簡單，使用HTTP頭部實現。我們將使用Helmet。

有一個簡單的安全性頭部叫做`X-XSS-Protection`。它不能保護你免受所有種類的XSS，但是它可以保護你免受反射型XSS攻擊。不安全的搜索引擎是反射型XSS的最好例子。在每個搜索引擎中，當你進行一次查詢，你的查詢就會顯示到屏幕中(通常在頂部，並將他變成URL的一部分)。

```
https://mysearchengine.biz/search?query=candy
```

現在想像你在搜索`<script src="http://evil.com/hack.js"></script>`。它的URL看起來可能會像這樣：

```
https://mysearchengine.biz/search?query=<script%20src="http://evil.com/hack.js"></script>
```

現在，如果搜索引擎把這個查詢放置到HTML頁面中，你就已經給這個頁面注入了一個腳本！如果我將這個URL發給你並且你點擊了鏈接，我就可以控制它來做惡了。

防止這類攻擊的第一步就是對用戶的輸入進行審查。在這之後，你可以設置`X-XSS-Protection`頭部來防止一些瀏覽器進行會導致你出錯的腳本。如果使用Helmet，這只需要一行：

```
app.use(helmet.xssFilter());
```

Helmet同樣允許你設置另一個被稱為`Content-Security-Policy`的頭部。坦白說，光`Content-Security-Policy`就可以說一章。[https://www.html5rocks.com/en/tutorials/security/content-security-policy/](https://www.html5rocks.com/en/tutorials/security/content-security-policy/)查看HTML5 Rocks指南獲取更多信息，一旦你理解它，你就可以使用Helment的csp中間件了。

這兩個Helmet頭部在任何地方都跟處理用戶輸入同等重要。所以首先要做這兩件事情。

### 跨站請求偽造(CSRF)預防

假設我已經登陸我的銀行。你想要我給你的帳戶轉100萬美元，但是你並不是以我的身份登陸。你如何讓我轉錢給你？


#### 攻擊

在銀行站點中，有一個“轉帳”表單。在這表單中，我填入錢和收錢者然後點擊發送。背地裡，被POST請求一個URL。銀行將會確認我的cookie是否是正確的，如果是的話，它們就會打錢了。

你可以製造一個攜帶數量和接收者的POST請求，不過你不知道我的cookie，並且你不可能猜到它；它是一串很長的字符串。所以，你是否可以讓我發送一個這個POST請求呢？你可以透過跨站請求偽造來做到(CSRF有時也被稱為XSRF)。

為了實現這個CSRF攻擊，基本上你會讓我在不知情的情況下提交一個表單。假設你已經編寫了下面代碼清單這樣的表單：

```
<h1>Transfer money</h1>
<form method="post" action="https://mybank.biz/transfermoney">
    <input name="recipient" value="YourUsername" type="text">
    <input name="amount" value="1000000" type="number">
    <input type="submit">
</form>
```

假設你將它放置到一個你可以控制的HTML頁面文件中；可能會是hacker.com/stealmoney.html。你可以給我發送一封郵件，然後說“點擊這裡來看我的一些小貓照片！”如果我點擊了他，我將會看到：

![](http://i.imgur.com/ll7PLLc.png)

然後你可以利用JavaScript讓它自動提交表單，就像這樣：

```
<form method="post" action="https://mybank.biz/transfermoney">
    <!-- ... -->
</form>
<script>
    var formElement = document.querySelector("form");
    formElement.submit();
</script>
```

如果我得到的頁面是這個，表單會被立刻提交並且發送到我的銀行，接著一個頁面說“恭喜，你剛剛已經轉出了100萬美元”。

你完全可以對受害人隱藏它。首先，你在你的頁面編寫一個`<iframe>`。然後你可以使用表單的target屬性，從而表單的提交是在內部的iframe進行，而不是整個頁面。如果你讓這個iframe很小或不可見(css很容易做到！)，然後我將永遠不會知道我被入侵了，直到我的錢變少。

我的銀行需要保護我免受這種情況。但是怎麼做到呢？

#### CSRF預防概要

我的銀行已經透過檢查cookie來確認我就是本人。駭客不可以在我沒有做任何事情的時候進行CSRF攻擊。不過，一旦銀行知道是我本人，它如何能確定這是我希望進行的操作，還是我被欺騙來做的這個操作呢？

我的銀行做出這樣的決定：如果用戶提交一個POST請求到mybank.biz/transfermoney，他們不會馬上執行這個任務。在處理這個POST請求之前，用戶將會看到一個告訴他們會把錢轉到哪裡的頁面——假設這URL是mybank.biz/transfermoney_form。

所以，當銀行發送mybank.biz/transfermoney_form的HTML頁面的時候，它已經為這個表單添加了一個隱藏元素：一個完全隨機，不可測的token字符串。你會在下方代碼清單看到這個表單的代碼。

```
<h1>Transfer money</h1>
<form method="post" action="https://mybank.biz/transfermoney">
    <!-- 通常CSRF token的值在每個用戶的每次請求都會不同 -->
    <input name="_csrf" type="hidden" alue="1dmkTNkhePMTB0DlGLhm">
    <input name="recipient" value="YourUsername" type="text">
    <input name="amount" value="1000000" type="number">
    <input type="submit">
</form>
```

現在，當用戶透過POST請求提交一個表單，銀行將會驗證發送的CSRF token就是用戶剛剛收到的。如果是的話，銀行將可以很肯定的認為，用戶剛剛訪問了銀行網站，因此會準備進行轉帳。如果不是，用戶可能被騙了——不會進行轉帳。

簡單來說，你需要做兩件事情：

1. 在你每次請求用戶資料的時候創建一個隨機的CSRF token
2. 在每次涉及到資料的時候驗證隨機的token

#### 在Express中進行CSRF防護

Express團隊有一個簡單的中間件用於處理這兩個任務：

csurf([https://github.com/expressjs/csurf](https://github.com/expressjs/csurf))。csurf中間件會做這兩件事情：

- 它給request對象添加了req.csrfToken方法。你會在每次發送一個表單的時候發送一個token。如果請求是除GET之外的其他方式。它會查找一個叫做_csrf的參數來驗證請求，如果驗證失敗的話就會創建一個錯誤。(從技術上來說，它同樣會跳過HEAD和OPTIONS請求，不過它們並不常用。中間件也將會在一些其他地方查找CSRF token；詳情見文檔。)

我們運行npm i csurf --save安裝這個中間件。

csurf中間件依賴於多種session中間件來解析request的body。如果你需要CSRF防護，你可能有一些用戶的概念了，這意味著你可能已經使用過它們了，僅僅是express-session和body-parser做這個工作。確保你是用csurf之前使用了它們。Example：[https://github.com/EvanHahn/Express.js-in-Action-code/tree/master/Chapter_10/csrf-example](https://github.com/EvanHahn/Express.js-in-Action-code/tree/master/Chapter_10/csrf-example)。

我們簡單的require和use來使用這個中間件。一旦你已經使用了這個中間件，你可以在渲染視圖的時候獲取到token：

```
const csrf = require('csurf');

// ...

// 在此之前已經引入了body parser和session中間件

app.get('/', (req, res) =>
    res.render('myview', {csrfToken: req.csrfToken()});
);
```

現在，在一個視圖中，你將看到csrfToken變數轉換成一個叫做_csrf的隱藏input。它的代碼在EJS模板中大概是這樣：

```
<form method="post" action="/submit">
    <input name="_csrf" value="<%= csrfToken %>" type="hidden">
    <!-- ... -->
</form>
```

基本就是這樣。一旦你為你的表單添加了一個CSRF token，csurf中間件將會會你處理餘下的事情。

這不是必須的。不過你可能想要一些處理失敗的CSRF。你可以定義一個錯誤中間件來檢測CSRF錯誤，就像下：

```
// ...

app.use((err, req, res, next) => {
    // 如果不是CSRF錯誤的話則跳過本次處理
    if (err.code !== 'EBADCSRFTOKEN') {
        next(err);
        return;
    }
    // 錯誤代碼403是“禁止”
    res.status(403);
    res.send('CSRF error.');
});

// ...
```

你可能想訂製錯誤頁，同時你也想讓他給你發送一條消息——有人想要黑你的一個帳戶！

## 確保依賴項的安全

使用第三方模組，不需要編寫大量的模板代碼，不過你要付出一個代價：你把信任交托給了這些模組。這些模組難道就不會帶來一些安全問題嗎？

這裡有三個方法可以讓你確保依賴項的安全：

1. 自己審核代碼安全
2. 確保你使用的是最新版本
3. 核對Node安全項目

### 審查代碼

你通常可以輕鬆的審查你代碼的依賴項。雖然很多像Express這樣的模組有著相對較大的面積，很多你安裝的模組只有幾行，你可以快速地理解它們。也是很好的學習方式。

查看項目的整體狀態同樣是值得的。如果一個模組很舊但工作正常沒bug，它可能就是安全的。不過如果他有很多bug報告且長時間不更新，這可不是一個好的現象！

### 確保你的依賴項是最新的

將模組更新到最新版本總會是一件好事。人們優化性能、修復bug、添加API。你可手動的為你的依賴項尋找它們的最新版。

在你項目目錄，運行`npm outdated --depth 0`，然後你會看到類似下面這樣的輸出：

```
Package   Current   Wanted   Latest   Location
express   5.0.0     5.4.3    5.4.3    express
```

如果你有其他過時的包，命令行中同樣會列出報告。進入你的package.json更新版本，然後運行npm install來獲取最新版本。經常檢查是個不錯的主意。

>**什麼是depth?**  
>`npm outdated --depth 0`將會告訴你都安裝了哪些過時的模組。`npm outdated`在沒有depth標記的情況下，將會告訴你有哪些過時的模組，包括不是你直接安裝的。使用--depth標記只會展示可用的信息，否則你將得到大量不實用的信息。

另一個需要注意的是：你同樣需要確保妳的Node是最新版本。

### 核對Node安全項目

有時，模組存在一些安全問題。一些不錯的小伙建立了Node安全項目，這是一個致力於審核每個npm倉庫中模組的偉大項目。他們會在發現一個不安全模組時，在[https://nodesecurity.io/advisories](https://nodesecurity.io/advisories)發布相應的公告。

Node安全項目還附帶了一個叫nsp的命令行工具。這個簡單而強有力的工具會掃描出package.json中不安全的依賴項(透過與資料庫進行比對)。

`npm i -g nsp`，然後在與package.json的同個目錄中，運行：

```
nsp check

絕大多數，你會被告知你的package是安全的。不過有些時候，你的依賴項(或依賴項的依賴項)中存在安全漏洞。

如果你使用的Express版本依賴於serve-static是2015年初的版本(有安全隱患)，那麼運行`nsp check`時你會看到這樣的信息：

```
Name           Installed   Patched    Vulnerable Dependency
serve-static   1.7.1       >=1.7.2    myproject > express
```

注意到這個模組依然可能存在隱患；在npm中存在大量的模組，Node安全項目可能沒辦法全部審核它們。不過他是又一個可以確保你app安全的工具。

## 處理Server崩潰

你的Server可能在某個時刻崩潰。有很多東西可以讓你的Server崩潰。

有一個叫做Forever([https://github.com/foreverjs/forever](https://github.com/foreverjs/forever))的簡單工具可以幫你應對這個問題。Forever會在你app崩潰了，嘗試重新運行它。

運行`npm i forever --save`安裝Forever。然後package.json的npm啟動腳本調整為：

```
"scripts": {
    "start": "forever app.js"
}
```

現在你的Server將會在崩潰的時候重啟了。

>可看簡單的實戰示例：[https://github.com/EvanHahn/Express.js-in-Action-code/tree/master/Chapter_10/forever-example](https://github.com/EvanHahn/Express.js-in-Action-code/tree/master/Chapter_10/forever-example)。

## 各種小技巧

我們涵蓋了大量像跨站腳本攻擊和HTTPS這樣的大主題。還有一些讓你的Express應用程序更加安全的技巧。本部分主題跟先前的主題同等重要，但是他十分的快捷方便，同時還能減少你可能被攻擊的地方。

### 這裡沒有Express

最好讓駭客不知你用Node + Express！

然而，在缺省的狀態下Express會將這個信息公佈出來。在每次請求中，都會有一個HTTP頭部來制定你的網站是由Express驅動的。`X-Powered-By`：默認情況下，每次請求的時候都會發送Express。你可以透過一個簡單的設置來禁止它。

```
app.disable('x-prowered-by');
```

禁止`x-prowered-by`選項來設置頭部。設置禁止之後會讓駭客攻擊變得稍微困難一些。

### 預防點擊劫持

某位駭客想要找出你社交網絡的私人信息。它希望你會公開你的個人資料。透過iframe方式隱藏社交網路確認公開私人信息的頁面在一個無害的頁面後面。點擊位置與“Click to make profile public”按鈕重疊而上。你一旦無預警的點擊，就可以不知不覺讓你公開你的私人信息。

![](http://i.imgur.com/j7eNwZ5.png)

我認為這個方法十分聰明。不過這個詭計也很容易預防。

很多瀏覽器會監聽一個叫做X-Frame-Options的頭部。如果它載入了一個frame或iframe，那麼頁面就會發送X-Frame-OPtions限制，瀏覽器不會再載入frame了。

X-Frame-Options有三個選項。

- DENY可以阻止任何人把你的網站放置到frame中。
- SAMEORIGIN阻止一些人把你網站放置到frame中，不過你的站點是被允許的。
- ALLOW-FROM讓別的網站可以放置frame。

我建議使用SAMEORIGIN或DENY選項。剛往常一樣，如果你使用了Helmet，你可以很輕鬆設置它們：

```
app.use(helmet.frameguard("sameorigin"));
// or ...
app,use(helmet.frameguard('deny'));
```

Helmet中間件將會設置X-Frame-Options，所以你不用擔心你的頁面會招到點擊劫持攻擊。

### 讓Adobe產品遠離你的站點

諸如Flash Player和Reader這樣的Adobe產品會生成跨域web請求。因此，一個Flash文件可以給你的server發送一個請求。如果別的網站提供一個惡意的Flash文件，這個網站的用戶就可以向你的Express應用程序發送任意數量的請求(可能在你不知情的情況下)。這會導致他們利用發送請求或者加載你不希望的資源來打擊你的server。

在你的網站根目錄添加一個名為*crossdomain.xml*的文件就可以輕鬆的預防這個問題。當Adobe產品準備載入你的域名文件時，它會首先檢查crossdomain.xml文件來確保你的域名允許使用它。對管理員來說，你可以定義XML文件來確定Flash用戶是否會出現在你的站點。然而，你可能不希望Flash用戶出現在你的頁面：

```

<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
 <site-control permitted-cross-domain-policies="none">
</cross-domain-policy>
```

它阻止了所有Flash用戶加載你的網站，除非他們來到你的域名。如果你對相應的策略改興趣，請查看：[https://www.adobe.com/devnet/articles/crossdomain_policy_file_spec.html](https://www.adobe.com/devnet/articles/crossdomain_policy_file_spec.html)。

### 不要讓瀏覽器推斷文件類型

想像一個用戶給你的server上傳了一個名為*file.txt*純文本文件。你server在提供server的時候使用的是`text/plain`類型，因為他就是純文本。到目前為止，這很簡單。但如果*file.txt*中包含了：

```
// 一個惡意腳本可能會以純文本的形式儲存

function stealUserData() {
    // something evil in here ...
}
stealUserData();
```

雖然你把這個文件作為純文本提供，不過因為他看起來像JavaScript，所以一些瀏覽器就會嘗試相應的文件類型。這意味著你可以利用`<script src="file.txt"></script>`來運行這個文件。很多瀏覽器允許你這麼運行file.txt即使文本類型不是JavaScript！

這個示例可以延伸到，如果file.txt看起來像是HTML，那麼瀏覽器就會把它解釋為HTML。這個HTML頁面可以包含能做壞事的惡意JavaScript！

幸好，你可以透過一個HTTP頭部來修復這個問題。你可以設置X-Content-Type-Options頭部為nosniff。Helmet自帶了noSniff中間件，你可以這樣調用它：

```
app.use(helmet.noSniff());
```

一個HTTP頭部就把問題解決了！

## 總結

像駭客一樣思考，可以幫助你發現漏洞。

使用諸如JSHint這樣的語法檢查器可以幫助你在代碼中發現bug。

在Express解析查詢字符串存在一些陷阱。你需要知道你參數可能的變數類型。

HTTPS可以取代HTTP。

跨站腳本，跨站請求偽造，以及間接攻擊可以被緩解。永遠不要盲目的相信用戶的輸入，每一步的效驗工作都可以讓你變得更加的安全。

Server是會崩潰的。Forever就是一個讓你在Server出錯之後重新運行的工具。

使用Node安全項目來核對你的第三方代碼。