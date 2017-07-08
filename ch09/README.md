# chap09. 測試Express應用程序

>**本章涵蓋**  
>測試是如何確保你代碼的行為
>常規測試練習  
>利用Mocha和Chai在Node.js進行測試  
>使用Mocha, SuperTest以及Cheerio

讓代碼更加可靠：

- 編輯器和語法檢查器，會自動掃瞄程序的潛在bug
- 代碼效驗，可讓其他人找到他們編寫錯誤的地方
- 風格指南，可幫助你的開發團隊保持一致

自動化測試是另一個解決bug的強力方式。自動化測試讓你編寫你想要的軟件特性，然後讓你更加自信的說“我的代碼工作了！”。它能夠讓你在代碼崩潰的情況下準確無誤的重構代碼，並且在代碼錯誤的時候你也可以很容易地獲取反饋信息。

如果你想要讓你的Express應用程序獲得這些好處。本章結束後，你將：

- 從總的方向上理解測試的作用
- 了解測試的類型
- 能夠做到測試驅動開發(TDD)，理解並使用red-green-refactor模組進行開發
- 為普通的Node.js代碼來編寫、運行，和組織測試，從而確保你的函數和模型能夠達到預期(使用**Mocha**和**Chai**工具)
- 測試你的Express應用程序，從而確保你的Server特性能達到預期效果(使用**SuperTest**模組)
- 測試響應的HTML並保證視圖生成了正確的HTML(使用一個類jQuery模組**Cheerio**)

## 什麼是測試？ 為什麼測試這麼重要？

通常，我們**想像出來的代碼行為**和其**實際的代碼行為**通常是沒有聯繫的。沒有任何程序的代碼會永遠100%無bug的；進行測試是我們工作中的一部分。

自動化測試有效規範化你的程序，但它並不是用文字語言編寫的；它是在電腦中編寫的代碼，這就意味著你可以自動驗證它。測試通常是自動化測試的簡稱，並且它也意味著運行測試代碼來檢查你的實際代碼。

自動化驗證最主要是讓你對代碼的可靠度更加自信。

在你想要變更你的代碼的時候它同樣很有幫助。可自信的認為這次重構沒有破壞任何東西。

編寫測試從而使得你可以自動認證你代碼的任務。

### 測試驅動開發

一開始就編寫測試會有很多的好處。當你最開始編寫測試的時候，你直接編寫你的規範。當你完成測試的編寫，你已經告訴了電腦如何詢問"我的代碼編寫完畢了嗎?"如果你有任何的錯誤測試，則說明你的代碼沒有符合規範。如果所有的測試都通過了，則說明你的代碼符合你的逾期。如果一開始就編寫代碼的話很可能會誤導你，這會導致你編寫不出完整的測試。

一開始就編寫測試的時候，你不得不在你真正編寫代碼前考慮你的代碼應該如何工作。這樣可以幫助你設計想像中的代碼。TDD可以幫助你顧全大局，明白你的代碼應該如何工作同時進行更加優雅的設計。

"優先編寫測試"的哲學被稱為測試驅動開發，簡稱TDD。之所以這命名是因為**測試決定你的代碼形式**。

TDD真的可以幫助到你，不過有些時候它會放慢你的速度。如果你的規範不明確，你可能花費很多時間編寫測試，除非意識到你不打算實現什麼!現在你已經編寫所有的無用測試並且花費了很多時間。除非你的規範有點模糊，否則TDD將會限制你程序的靈活性。如果你根本沒有編寫任何的測試，那麼你就是與TDD哲學背道而馳了。

TDD決定是否適合你和你的代碼。TDD適用於某些場景，也不適用於其他場景。

#### TDD是如何工作的：紅、綠、重構

![](http://i.imgur.com/4jQ9HpL.png)

TDD週期通常會重複這三個步驟，調用紅、綠、重構。

1. 紅色步驟。

    TDD，所以你優先編寫測試。在你真正開始編碼之前，你編寫了這些測試，這時不會有任何測試被通過──在沒有真正編寫代碼的時候它們可以怎麼樣呢?

    在紅色步驟期間，你編寫了所有測試，你編寫它們並看到它們全部失敗。這個步驟之所以命名紅色，是因為你總是會看到你的測試失敗。

2. 綠色步驟。

    現在你編寫了你所有的測試，你開始編寫真實的代碼來滿足所有的測試。當你取得進展，你的測試將會慢慢由紅(failing)轉綠(passing)。一旦你全部都是綠色，你就可以準備步驟3了。

3. 重構步驟。

    如果你所有測試都變綠了，這就意味著你所有的代碼都正常工作了，不過它可能不夠完善。假設你的函數速度很慢或你的變數名稱用的不好。就像一個作者清理一抽屜的書，你回頭清理你的代碼。因為你已經有了所有的測試，在你進行重構的時候你可以不用擔心會對代碼造成一些不可預見的問題。

4. 重複流程。

    你程序的所有代碼都已經編寫完成了，所以我們回到步驟1，然後為下一部份編寫測試。

### 首要原則：有疑問時進行測試

簡單來說，你可以沒有太多的測試。你可以想像，測試成功並不能意味著你的代碼運作了，不過這會是個好的開始。出於這個原因，你想要盡可能測試你的代碼。你想要涉及你軟件的每一個(合理)的角落，從而確保它的表現符合你的預期。通過的測試越多，代碼的運作就越符合你的預期。你沒有辦法100%肯定，一些代碼會在你沒想到的地方崩潰，但是如果你在代碼中任何你能想到的地方拋出錯誤，它可能就會工作了。

>**代碼覆蓋率**  
>測試使你代碼增加信心，不過它也僅是一個方法。就像我們開頭講的那樣，還有大量的諸如代碼審查和代碼簡化的其他方法。一個擴展測試會透過代碼覆蓋率來進一步增強你的信心。  
>代碼覆蓋率工聚會檢測你有多少代碼被測試了。Node中最普遍的代碼覆蓋率工具應該是[Istanbul](https://github.com/gotwarlost/istanbul)。

不編寫測試的唯一理由就是它會花費時間。它同樣會讓電腦花費時間──一些測試會花費較長時間──並且它也會讓你失去時間──它需要時間去測試類型。

## 介紹Mocha測試框架

就像可只使用Node來編寫web server一樣，我們同樣可以只使用Node來編寫測試。你可以創建一個文件用於檢查一大堆條件，從而確保一切可以正常運作，之後你可以用console.log來輸出結果。跟使用Express類似，你會發現原生的方法十分冗長，你必須編寫很多的模板代碼從而寫出編寫測試。

Mocha是一個能幫助你減少很多棘手問題的測試框架。(它是Express作者寫的。)它提供了很棒的語法來組織你的測試，它還有很多其他的特性，例如異步測試支持和高可讀性輸出。它沒有明確指出需要綁定Express。所以可使用它來測試Express應用程序、JavaScript函數、資料庫方法，以及其他Node運行時裡的東西。

先來測試個簡單的函數capitalize函數讓字符串首字母變大寫，其餘小寫：

### Node.js如何測試任務？

測試Node.js應用程序中有三個主要的部分：(你編寫的)實際代碼，(你編寫的)測試代碼，以及測試驅動程序(通常是第三方模組，可能不會由你編寫)：

- 實際代碼：就是你想要測試的代碼。在Node.js環境中，它會是module.exports分配的一些東西。
- 測試代碼：測試你的實際代碼。它需要你希望運行測試的代碼，然後開始詢問它。這個函數是否返回了它想要返回的東西？你對象的行為是否是正常的？
- 測試驅動程序：是你電腦中的一個可執行程序。它查看並運行你的測試代碼。測試驅動程序會打印這些測試成功或失敗，以及發送該測試花費多少毫秒。你會在本章用Mocha。

你的實際代碼和測試代碼位於同一個倉庫中，你同樣將定義Mocha作為依賴項，並且你將它安裝到你的本地倉庫。

### 設置Mocha和Chai斷言庫

*capitalize.js*：

```
function capitalize(str) {
    let firstLetter = str[0].toUpperCase();
    let rest = str.slice(1).toLowerCase();
    return firstLetter + rest;
}

module.exports = capitalize;
```

*package.json*：

```
{
  "name": "first-test",
  "private": true,
  "scripts": {
    "test": "mocha"
  },
  "dependencies": {
    "chai": "^4.0.2",
    "mocha": "^3.4.2"
  }
}
```

你在這使用兩個模組：Mocha和Chai。Mocha是一個測試框架。你使用它的語法的時候你會說“這是我要測試的東西，讓我來設置它，在這裡我要設置A，這裡我要設置B，以此類推”。

Chai是一個斷言庫。有很多的斷言庫(包括Node內置的那個)。然而Mocha列出了測試，Chai說：“我希望helloWorld函數返回'hello, world'。”真正的語法是`expect(helloWorld()).to.equal("hello, world")`，他們看起來很書面化。如果helloWorld函數返回"hello, world"，你的測試將被通過。如果沒有，將會出現一個錯誤，並告訴你測試結果不符合你的預期。

Mocha等待斷言庫拋出一個錯誤。如果沒有，測試將會通過。如果拋錯，測試將會失敗。這就是你使用Chai的原因——它是在你測試失敗的時候拋出錯誤的好方法。

Mocha和Chai之間的區別很重要。Mocha是一個測試驅動程序，所以有一個實際可執行文件來讓你運行。Mocha在你代碼中注入了全局變數——如你所見，這些全局變數存在你的每個測試結構。在每個測試中，你使用Chai來測試你的代碼。當你測試capitalization，你將使用Mocha來進行碎片化測試。從Chai的角度來看，你調用妳的capitalization並且確保你的模組輸出結果與你的預期相符。

### 在你運行測試的時候發生了什麼

![](http://i.imgur.com/YQWgaWl.png)

### 利用Mocha和Chai編寫你的第一個測試

*test/capicalize.js*：

```
const capitalize = require('../capitalize');

const chai = require('chai');
const expect = chai.expect;


// 從Mocha的角度來說，describe的規範基本相同
describe('capitalize', () => {

    // 從Mocha角度來說，每個規範都有一個標題和相應的運行代碼
    it('capitalizes single words', () => {
        // 從Chai角度來說，真正執行斷言
        expect(capitalize('express')).to.equal('Express');
        expect(capitalize('cats')).to.equal('Cats');
    });

});
```

你`describe`了一個測試套件。這會是你應用程序的主要組成部分；它可以是一個類或者只是一些行的功能。這個套件叫做“capitalize”；它是英語，並不是代碼。在這例子中，這個套件描述了capitalization函數。

在這套件中，你定義了一個測試。他是一個JavaScript函數，這個函數告知一些你程序應該做的事情。It設置了存英語(“It capitalizes single words”)和相關代碼。對於每個套件，你可以編寫很多測試來測試你所想的。

最後，在這個測試中，你expect。

運行npm test來通過相應流程：

![](http://i.imgur.com/AISwxSO.png)

```
$ npm test

> first-test@ test /Users/eden90267/Desktop/node/express-in-action/ch09/first-test
> mocha



  capitalize
    ✓ capitalizes single words


  1 passing (8ms)


```

通過測試了！

但你並沒有脫離險境；還會編寫很多的測試來更加確定你代碼的工作。

### 添加更多的測試

我們來編寫更多的測試來驗證這些煩人的問題。

```
// ...
it('makes the rest of the string lowercase', () => {
    expect(capitalize('javaScript')).to.equal('Javascript');
});
// ...
```

結果(`npm test`可簡寫`npm t`)：

```
npm t   

> first-test@ test /Users/eden90267/Desktop/node/express-in-action/ch09/first-test
> mocha



  capitalize
    ✓ capitalizes single words
    ✓ makes the rest of the string lowercase


  2 passing (10ms)

```

現在你更加確信其餘字母會小寫了。不過你現在依然不安全。

```
// ...
it('leaves empty strings alone', () => {
    expect(capitalize('')).to.equal('');
});
// ...
```

結果：

```
 npm t

> first-test@ test /Users/eden90267/Desktop/node/express-in-action/ch09/first-test
> mocha



  capitalize
    ✓ capitalizes single words
    ✓ makes the rest of the string lowercase
    1) leaves empty strings alone


  2 passing (11ms)
  1 failing

  1) capitalize leaves empty strings alone:
     TypeError: Cannot read property 'toUpperCase' of undefined
      at capitalize (capitalize.js:5:29)
      at Context.it (test/capitalize.js:22:16)



npm ERR! Test failed.  See above for more details.
```

看來當你傳遞一個空字符串str[0]的值會變成undefined，所以你必須確保它被定義過。將方括號替換為`charAt`方法。

```
function capitalize(str) {
    let firstLetter = str.charAt(0).toUpperCase();
    let rest = str.slice(1).toLowerCase();
    return firstLetter + rest;
}

module.exports = capitalize;
```

```
$ npm t

> first-test@ test /Users/eden90267/Desktop/node/express-in-action/ch09/first-test
> mocha



  capitalize
    ✓ capitalizes single words
    ✓ makes the rest of the string lowercase
    ✓ leaves empty strings alone


  3 passing (9ms)

```

下面再添加幾個測試，從而確保你的程序變得更加健壯：

```
it('leaves strings with no words alone', () => {
    expect(capitalize(' ')).to.equal(' ');
    expect(capitalize('123')).to.equal('123');
});

it('capitalizes multiple-word strings', () => {
    expect(capitalize('what is Express?')).to.equal('What is express?');
    expect(capitalize('i love lamp')).to.equal('I love lamp');
});

it('leaves already-capitalized words alone', () => {
    expect(capitalize('Express')).to.equal('Express');
    expect(capitalize('Evan')).to.equal('Evan');
    expect(capitalize('Catman')).to.equal('Catman');
});
```

運行npm test之後你應該會看到你的測試通過了。

嘗試用String對象測試。所有的JavaScript風格指南都會警告你不要使用String對象——即它跟`==`或`eval`一樣會導致意外的行為。很遺憾，有些經驗不足的程序員在場。你可將bug歸咎他們的失誤，不過你同樣可認為你的代碼不應該有問題：

```
it('capitalizes String objects without changing their values', () => {
    var str = new String('who is JavaScript?');
    expect(capitalize(str)).to.equal('Who is javascript?');
    // str.valueOf()將String對象轉換為正常的字符串
    expect(str.valueOf()).to.equal('who is JavaScript?');
});
```

你對你的capitalization函數進行7次測試，最後一次運行`npm test`確保所有測試成功：

```
$ npm t

> first-test@ test /Users/eden90267/Desktop/node/express-in-action/ch09/first-test
> mocha



  capitalize
    ✓ capitalizes single words
    ✓ makes the rest of the string lowercase
    ✓ leaves empty strings alone
    ✓ leaves strings with no words alone
    ✓ capitalizes multiple-word strings
    ✓ leaves already-capitalized words alone
    ✓ capitalizes String objects without changing their values


  7 passing (8ms)

```

看看你！你現在已經對你的capitalization函數工作更加自信，即使是傳入奇怪的變數。

### Mocha和Chai的更多特性

這兩個模組不是只能作等號操作符。我們將在這把所有選項過一遍。

#### 在每個測試前運行代碼

我們通常在運行斷言之前運行設置代碼。你可使用Mocha的beforeEach函數。

假設你已經編寫了一個User模型並且你想對他進行測試。

```
const expect = require('chai').expect;

const User = require('../models/user');

describe('User', () => {

    let user;

    // 在每個測試之前運行，從而確保在每個測試中都有定義
    beforeEach(() => {
        user = new User({
            firstName: 'Douglas',
            lastName: 'Reynholm',
            birthday: new Date(1975, 3, 20)
        });
    });

    it('can extract its name', () => {
        expect(user.getName()).to.equal('Douglas Reynholm');
    });

    it('can get its age in milliseconds', () => {
        let now = new Date();
        expect(user.getAge()).to.equal(now - user.birthday);
    });

});
```

我們沒有重新定義每個測試中的User對象(每個it塊內)。相應的代碼被定義到`beforeEach`塊中，它裡面的代碼會在運行每個測試之前被重新定義。

#### 測試錯誤

capitalization函數，如果你傳入的不是字符串，比如一個數字或undefined，你希望你的函數會拋出某種類型的錯誤。你可以使用Chai來測試它：

```
// ...
it('throws an error if passed a number', () => {
    expect(() => capitalize(123)).to.throw(Error);
});
// ...
```

這個測試會傳入123來調用capitalize，然後拋出一個錯誤。唯一棘手的一點就是你必須給他包裏一層function。這是因為你不想讓你的測試代碼創建一個錯誤——**你想要錯誤代碼被Chai捕獲到**。

#### 否定測試

基於Chai的“語法讀起來就像英語一樣”的精神，你可以使用`.not`來進行否定測試：

```
it('changes the value', () => {
    expect(capitalize('foo')).not.to.equal('foo');
});
```

我們值開始了解了Chai能做事情的毛皮，對於更多特性，可查看文檔：[http://chaijs.com/api/bdd/](http://chaijs.com/api/bdd/)。

## 用SuperTest對Express Server進行測試

前面的技巧對於測試，諸如模型特性或者功能工具函數這樣的業務邏輯很有用。它們通常被稱為單元測試(unit test)；它們測試你app的獨立單元。不過你同樣想測試Express應用程序中的路由和中間件。你可能想要確保你的API會返回我們期待的結果，或者你要提供的靜態文件，或一些其他東西。它們通常被稱為集成測試，把集成系統作為一個整體進行測試，而不是孤立的測試。

你將使用SuperTest([https://github.com/visionmedia/supertest](https://github.com/visionmedia/supertest))模組來完成任務。SuperTest包裏了你的Express server然後給它發送請求。一旦請求返回，你就可以為響應編寫斷言了。例如，你可能想要確保當你向主頁發送一個GET請求的時候，會返回一個HTTP 200狀態碼。SuperTest將會給主頁發送一個GET請求，之後當你獲得響應的時候，確保它的HTTP狀態碼是200。你可用它測試你在應用程序中定義的中間件或路由。

很多瀏覽器發送一個User-Agent頭部來指定發送給server的瀏覽器類型。如果你使用的是移動設備，通常會給你提供一個移動版本的網站：一個server可以根據你設備的類型給你發送不同版本的頁面。

讓我們來編寫一個“我的User Agent是什麼？”的應用程序來獲取用戶的User Agent字符串。browser訪問，它將向你提供一個典型的HTML視圖。你同樣可以以純文本形式獲得用戶User Agent。這裡只會有一個路由用於這兩個響應。如果訪問者訪問站點根目錄，大多數web瀏覽器並不會請求HTML，它們會以純文本形式展示User Agent。如果他們Accepts頭部提到HTML，這時候它們將會以HTML的形式獲得User Agent。

*package.json*：

```
{
  "name": "whats-my-user-agent",
  "private": true,
  "scripts": {
    "start": "node app",
    "test": "mocha"
  },
  "dependencies": {
    "ejs": "^2.5.6",
    "express": "^4.15.3"
  },
  "devDependencies": {
    "cheerio": "^1.0.0-rc.2",
    "mocha": "^3.4.2",
    "supertest": "^3.0.0"
  }
}
```

現在我們先來編寫測試，再補充你的應用程序。

TDD方法並不總是最好的；有時候你並不能確定你的代碼是什麼樣子的，所以在編寫測試的時候將會有點浪費時間。網上的TDD贊成者和反對者的爭論十分的激烈；這個例子將會嘗試使用TDD。

你將為你應用程序這兩部分編寫測試：

- 純文本API
- HTML視圖

首先你編寫純文本的API測試。

### 測試一個簡單的API

斷言(1)響應是正確的User Agent字符串，(2)響應是以純文本形式返回的。

```
const app = require('../app');

describe('plain text response', () => {
    // 定義測試
    it('returns a plain text response', (done) => {

    });

    it('returns your User Agent', (done) => {

    });
});
```

描述了一個測試套件(純文本模式)，然後定義了兩個測試，一個用於確保你獲得純文本響應，另一個確保你能獲取正確的User-Agent字符串。

你的第一個測試需要給server發送一個請求，確保Accept頭部被設置為`text/plain`，一旦它得到server的響應，你的測試就要保證它返回的是`text/plain`。SuperTest模組將會幫助你做到這一點，所以你需要在文件頂部`require`它。然後你將使用SuperTest來給你的server發送請求，然後看看響應是不是你想要的。

```

const supertest = require('supertest');

// ...

// 當你結束運行你代碼的時候就會被調用
it('returns a plain text response', (done) => {
    supertest(app)
        .get('/')
        .set('User-Agent', 'my cool browser') // 設置User-Agent頭部
        .set('Accept', 'text/plain') // 設置頭部來描述我們希望返回內容的類型
        .expect('Content-Type', /text\/plain/) // 期望內容類行為“text/plain”
        .expect(200) // 期望HTTP狀態碼為200
        .end(done);  // 在測試結束的時候調用done回調
});
```

下面逐行告訴你用SuperTest做的事情：

- 你透過將app作為一個參數來調用supertest的方式包裝你的app。它將會返回一個SuperTest對象。
- 你可透過傳入你想要請求的路由來調用SuperTest對象的get方法。
- 你給這個請求設置了選項：HTTP的Accept設置成text/plain，User-Agent設置為“my cool browser”。你多次調用set，因為你想要設置很多的頭部。
- 你第一次調用expect，你說“我想讓Content-Type匹配text/plain”。注意到這裡用正則表達式，這樣可以更加靈活匹配Content-Type是“text/plain”、“text/plain; charset=utf-8”再或者是其他類似的。你想測試純文本內容類型，不過在你不指定字符集的情況下，這例子是ASCII，它同時也是大多數字符的編碼。
- 第二次調用expect，確保HTTP獲得的狀態碼是200
- 最後，透過傳入done來調用end。done是一個Mocha傳入的回調函數，你使用它來標示異步測試全部完成。

接下來，你將填寫第二個測試，並用它來確保你的應用程式返回正確的User Agent：

```
it('returns your User Agent', (done) => {
    supertest(app)
        .get('/')
        .set('User-Agent', 'my cool browser')
        .set('Accept', 'text/plain')
        .expect((res) => {
            if (res.text !== 'my cool browser') {
                throw new Error('Response does not contain User Agent');
            }
        })
        .end(done);
});
```

中間的部分傳入一個函數來調用expect。如果res.text(text是你的應用程序返回的)跟你傳入的User-Agent頭部並不相等，那麼這個函數就會拋出一個錯誤。如果相等，這個函數就會正常結束掉。

最後一件事情：你的代碼有一些重複的地方。在這例子中，你總是給你的server發送同樣的請求：同樣的應用程序，同樣的路由，以及同樣的頭部。如何讓自己避免重複？使用Mocha的`beforeEach`特性：

```

const app = require('../app');

const supertest = require('supertest');

describe('plain text response', () => {
    // 定義測試

    let req;

    beforeEach(() => {
        req = supertest(app)
            .get('/')
            .set('User-Agent', 'my cool browser') // 設置User-Agent頭部
            .set('Accept', 'text/plain'); // 設置頭部來描述我們希望返回內容的類型
    });

    it('returns a plain text response', (done) => {
        req
            .expect('Content-Type', /text\/plain/) // 期望內容類行為“text/plain”
            .expect(200) // 期望HTTP狀態碼為200
            .end(done);  // 在測試結束的時候調用done回調
    });

    it('returns your User Agent', (done) => {
        req
            .expect((res) => {
                if (res.text !== 'my cool browser') {
                    throw new Error('Response does not contain User Agent');
                }
            })
            .end(done);
    });
    
});
```

`npm t`會失敗，現在創建`app.js`讓錯誤有所改善：

```
const app = require('express')();

module.exports = app;
```

當你運行npm test進行測試會失敗：

```
$ npm t

> whats-my-user-agent@ test /Users/eden90267/Desktop/node/express-in-action/ch09/whats-my-user-agent
> mocha



  plain text response
    1) returns a plain text response
    2) returns your User Agent


  0 passing (77ms)
  2 failing

  1) plain text response returns a plain text response:
     Error: expected "Content-Type" matching /text\/plain/, got "text/html; charset=utf-8"
      at Test._assertHeader (node_modules/supertest/lib/test.js:243:14)
      at Test._assertFunction (node_modules/supertest/lib/test.js:281:11)
      at Test.assert (node_modules/supertest/lib/test.js:171:18)
      at Server.assert (node_modules/supertest/lib/test.js:131:12)
      at emitCloseNT (net.js:1577:8)
      at _combinedTickCallback (internal/process/next_tick.js:77:11)
      at process._tickCallback (internal/process/next_tick.js:104:9)

  2) plain text response returns your User Agent:
     Error: Response does not contain User Agent
      at req.expect (test/txt.js:32:27)
      at Test._assertFunction (node_modules/supertest/lib/test.js:281:11)
      at Test.assert (node_modules/supertest/lib/test.js:171:18)
      at Server.assert (node_modules/supertest/lib/test.js:131:12)
      at emitCloseNT (net.js:1577:8)
      at _combinedTickCallback (internal/process/next_tick.js:77:11)
      at process._tickCallback (internal/process/next_tick.js:104:9)



npm ERR! Test failed.  See above for more details.
```

### 為你的第一個測試編寫代碼

```

const app = require('express')();

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.send(req.headers["user-agent"]);
});

app.listen(app.get('port'), () => 
    console.log(`App started on port ${app.get("port")}`));

module.exports = app;
```

npm test後只通過一半的測試，看取來需要返回一個正確的User Agent。我們在添加一行：

```
app.get('/', (req, res) => {
    // Content-Type 必須是純文本類
    res.type("text");
    res.send(req.headers["user-agent"]);
});
```

`npm test`：

```
$ npm t

> whats-my-user-agent@ test /Users/eden90267/Desktop/node/express-in-action/ch09/whats-my-user-agent
> mocha



App started on port 3000
  plain text response
    ✓ returns a plain text response (38ms)
    ✓ returns your User Agent


  2 passing (69ms)

```

### 測試HTML響應

創建*test/html.js*：

```
const app = require('../app');

const supertest = require('supertest');

describe('html response', () => {

    let req;
    beforeEach(() => {
        req = supertest(app)
            .get('/')
            .set('User-Agent', 'a cool browser')
            .set('Accept', 'text/html');
    });

    it('returns an HTML response', (done) => {

    });

    it('returns your User Agent', (done) => {

    });

});
```

現在我們來填寫第一個測試：

```
it('returns an HTML response', (done) => {
    req
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done);
});
```

下一個測試。首先，你需要編寫代碼來獲取server響應的HTML。

```
it('returns your User Agent', (done) => {
    req
        .expect((res) => {
            let htmlRes = res.text;
            // ...
        })
        .end(done);
});
```

你並不只是想要User Agent字符串出現在HTML中。你想要它在裡面出現一個指定的HTML標籤：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
<h1>Your User Agent is:</h1>
<p class="user-agent">Mozilla/5.0 (Windows NT 6.1; WOW64; rv:28.0) Gecko/20100101 Firefox/36.0</p>
</body>
</html>
```

你不需要在意大部分的HTML；你想要測試的是裡面類名為user-agent的。該如何做到呢？

進入Cheerio([https://cheerio.js.org/](https://cheerio.js.org/))，我們devDependencies列表中的最後一個依賴項。簡單來說，Cheerio是Node中的jQuery。你現在需要查看HTML然後找到裡面的User Agent。如果在瀏覽器環境中，你可以使用jQuery來應對它。因為你在Node環境中，你將會使用到Cheerio，它對於了解jQuery的人來說將會是十分熟悉的。你將使用Cherrio來解析HTML，找到User Agent所在的位置，並確保它是有效的。

```
it('returns your User Agent', (done) => {
    req
        .expect((res) => {
            let htmlRes = res.text;
            // 用你的HTML初始化一個Cheerio對象
            let $ = cheerio.load(htmlRes);
            // 從HTML中獲取User Agent
            let userAgent = $('.user-agent').html().trim();
            // 跟之前一樣對User Agent進行測試
            if (userAgent !== 'a cool browser') {
                throw new Error('User Agent not found');
            }
        })
        .end(done);
});
```

*app.js*：

```
const app = require('express')();
const path = require('path');

app.set('port', process.env.PORT || 3000);

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    let userAgent = req.headers['user-agent'] || 'none';

    if (req.accepts('html')) {
        // 如果請求接受HTML，則渲染index模板
        res.render('index', {userAgent});
    } else {
        res.type("text");
        res.send(req.headers["user-agent"]);
    }
});

app.listen(app.get('port'), () =>
    console.log(`App started on port ${app.get("port")}`));

module.exports = app;
```

創建*views/index.ejs*：

```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        html {
            font-family: sans-serif;
            text-align: center;
        }
    </style>
</head>
<body>
<h2>Your User Agent is:</h2>
<h1 class="user-agent">
    <%= userAgent %>
</h1>
</body>
</html>
```

偉大的時刻到來了。`npm test`運行你的測試：

```
$ npm t   

> whats-my-user-agent@ test /Users/eden90267/Desktop/node/express-in-action/ch09/whats-my-user-agent
> mocha



App started on port 3000
  html response
    ✓ returns an HTML response (43ms)
    ✓ returns your User Agent

  plain text response
    ✓ returns a plain text response
    ✓ returns your User Agent


  4 passing (95ms)

```

所有測試都通過了！現在你已經學會如何使用**Mocha**、**Chai**、**SuperTest**，以及**Cheerio**來進行測試了。

在你編寫代碼的時候，你希望你的代碼工作符合預期。這通常很難做到，不過利用測試的話，你可以更加的確信它們符合你的期望。

## 總結

你需要進行測試，因為測試可以讓你對代碼更加的自信。

有幾種類型的測試，從低級的單元測試到高級的綜合測試。

TDD是一個在真正編寫代碼之前先編寫測試的開發模式。通常，你處在紅、綠、重構 循環：你測試失敗是紅色，在你測試通過是綠色，並且一旦你的代碼工作了就對其進行重構。