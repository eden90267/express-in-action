# chap01. Express是什麼

Node.js ─ JavaScript運行環境。但它原生API十分基礎，很多時候僅靠原生API開發會顯得很無力，所以你需要寫一些模板來對這些API進行封裝，這時候Express誕生了。利用Express你可以輕鬆編寫Node.js web應用程序。

>Node.js：一個流行在web Server的JavaScript運行平台
>Express：一個致力於用Node.js來進行web開發的框架，使用它可以讓你更輕鬆的利用

Node.js誕生2009年。Node.js基於Google Browser的V8引擎，從瀏覽器脫離出來獨立的運行在Server端。所以現在Server端同樣也能把JavaScript作為後端語言使用了。

V8引擎在Node.js極力推崇異步編程，避開了多執行緒編程可讓你代碼變得更快更好。且有廣大的JavaScript類別庫支援。但是，Node.js最大的優勢還是能夠在前端和後端中同時使用甚至代碼復用。開發者再也不用為前後端語言不同而頻繁切換思維模式而煩惱了。

Node.js給你提供了一堆用於構建應用程序的底層特性。但是跟基於瀏覽器JavaScript一樣，Node.js提供的底層接口難用而且會導致代碼很冗長。

Express框架對Node.js提供的底層接口進行了封裝，它可幫助你更愉快利用Node.js進行web應用的開發。

Express類似於jQuery的哲學。jQuery的出現就是通過提供簡潔的API，使得開發者可以容易地進行功能的實現而不用自己過多的封裝代碼，與此同時也向開發者提供一些新的功能。

Express的目標也是可擴展性。它不干涉你應用程序的業務邏輯同時也讓你可以輕鬆地通過第三方類庫進行擴展。

## Node.js應用場景

Node.js並不是一個小孩子的玩具。

Node.js是一個JavaScript運行平台──一個運行JavaScript代碼的地方。

在瀏覽器之外使用JavaScript可以讓你做很多事情──常規編程語言可以做的任何事情──不過它主要還是用於web應用開發。

Node.js很快，有兩個理由：

1. 基於Google Browser速度著稱的V8引擎
2. 擅長處理高併發，它的高性能主要是通過它異步編程的方式體現出來的

在Node.js中，一個瀏覽器可能會向你的Server發送很多的請求。你開始回應這個請求與此同時開始接受其他請求。假設有兩個請求需連接外部資料庫，你可讓外部資料庫執行第一個請求，並且當這個時候外部資料庫開始運作之後，你就可以開始響應第二個請求了。你的code沒有辦法在同一時間內處理兩件事情，但你可以在外部機器運作的時候，不等待它把事情做完就接著響應後續的請求。

Node.js可以讓你更好的壓榨單核CPU的性能，但它並不擅長處理多核CPU。雖然Node.js也開始支持這種功能，但是跟別的語言相比這種功能在Node.js中並不是最優秀的。

就個人而言，選擇Node.js的理由並不是因為它的性能。我認為最大的原因就是可以在前後端使用統一的一種語言。

透過Node.js，開發者可以在前後端開發角色中切換自如。

## 什麼是Express?

Express是一個基於Node.js web服務特性的小型框架，它提供了簡潔的API並且增加了很多有幫助的新特性。它使得你可輕鬆的在你程序中建構**中間件**和**路由**；它還新增了十分有用的Node.js HTTP對象工具；它有利於你渲染動態的HTML視圖；它定義了一種容易實現的可擴展標準。

### Node.js中的函數

當你利用Node.js創建一個web應用程序(準確的說是一個web server)的時候。**你為整個應用編寫一個JavaScript函數**。這個函數用於監聽web browser發起的請求或者移動應用發起的請求再或者其他客戶端連接你的Server發起的請求。當接收到一個請求的時候，函數會將分析這個請求並決定如何回應這個請求。

我們把這個用於處理瀏覽器請求的JavaScript函數叫做**請求處理函數**(**request handler**)。

Node.js的HTTP服務處理客戶端以及你的JavaScript函數之間的關係，所以你不需要關注和處理複雜的網路協議。

在代碼中，這是一個包含兩個參數的函數：一個代碼request的對象以及一個代表response的對象。在你的時間/時區應用中，這個請求處理函數將**校對客戶端請求的URL**。如果請求的是主頁，那麼請求處理函數就應該返回包含當前時間的HTML頁面。否則的話，就應該返回404。很多的Node.js應用程序都會這麼做：編寫一個請求處理函數用於響應請求。從理論上來說這並不是什麼難事。

問題在於，如果Node.js的API變得更加複雜的話。假設我們要發送一個JPEG文件?你可能編寫45行代碼就能處理這個問題。在假設我們需要創建一個可復用的HTML模板?思考一下要如何解決這個問題。Node.js的HTTP服務是十分強大的，但它卻缺少了很多真正用於構建應用的特性。

![](http://i.imgur.com/nD8vyFy.png)

Express的出現就是為了讓你能夠更簡單的編寫Node.js web應用程序。

### Express給Node.js帶來什麼?

Express為Node.js HTTP服務帶新增兩大特性：

- 它把複雜的特性抽象出來，給Node.js HTTP服務添加很多便捷函數。例如，用原生API編寫發送一個JPEG文件的函數是十分複雜的(特別是考慮到性能問題的時候)；Express能把這個功能減少到一行代碼。
- 它能夠允許你把一個集成的request請求處理函數，重構為由很多小型的只負責處理特定請求的，單一request處理函數。這是十分利於維護和模組化的。

![](http://i.imgur.com/ST6YcQo.png)

上圖看起來似乎有些複雜，但是它在你實際應用開發的時候卻是相當的簡單，本質上它主要做了兩件事：

- Express不使用大型的request請求處理函數，而是讓你編寫很多的**小型函數**(其中可以使用很多不是你編寫的第三方函數)。有的函數將在request請求的時候執行(例如，一個打印請求日誌的函數)，有的函數只在特定的時候執行(例如，一個函數用於處理主頁或404頁面)。Express擁有很多實用的用於分隔這些請求的處理函數。
- 請求處理接收兩個參數：request和response。Node的HTTP服務提供了很多的功能；例如，Node.js的HTTP服務可以讓你獲取到瀏覽器的用戶代理信息並作為變量傳遞給你。Express參數在其中添加了額外的特性，例如你可以更加容易的獲取到訪問者的IP地址以及解析優化過的URL請求。response對象同樣也得到了增強；Express添加了諸如sendFile的方法，一個僅需一行就能實現45行原生代碼才能實現的文件傳輸函數。這可以使得你可以更加容易的編寫request請求處理函數。

你可利用Express提供的簡潔API，取代Node.js原生API編寫的冗長request請求處理函數，從而更加愉快的編寫很多小型的request請求處理函數。

## Express中的最小化哲學

Express作為一個框架，意味著你必須按照Express的方式來搭建你的應用程序。但Express的編寫方式不是很死板；它不會給你一個固定的結構。這也意味你可編寫不同類型的應用程序，從聊天應用程序到博客應用都可以。

我們很少單獨使用Express來搭建一個Express應用。Express本身並不是萬能的，你可能會發現你需要在你的應用程序中引入大量的第三方庫。在Express中你完全可以只關注你需要的部分，這種方式能夠使得你可以更好的理解你程序裡的每一部分。借用Unix哲學裡do-one-thing-well的思想，透過這種方式，能夠很好的把你當前關注的部分做好。

但是這種追求極簡的最小化原則卻是一把雙刃劍。雖然Express真的很靈活，也確實將你從混亂的代碼中解放出來，但是相比別的框架來說它做的還是太少了。這就意味著你需要在應用程序的結構上做更多設計，從而處理你所造成的錯誤，並且你也需要花更多的時間去尋找第三方模塊。

Express框架本身並不關注開發者應用程序的架構，所以不同的開發者可能會做不同的決策。

為讓你少寫一些代碼，你可去找一些第三方包來使用。有時候容易，其他時候，這是十分難做出選擇的。

不論大型框架還是小型框架誰能撐得久，不管怎麼說Express實際上是一個極簡的框架。

## Express的核心部分

一旦你真正的了解它，你就會發現Express擁有4個主要的特性：中間件、路由、子應用和便捷函數。

### 中間件

原生的Node.js使用一個request請求處理函數來應對，發送過來的request請求並決定如何在你的函數中處理它。

中間件的概念很簡單：不僅僅只使用一個request請求處理函數，你需要利用多個request請求處理函數來應對每個獨立的小任務。每個小的request請求處理函數就被稱為中間件函數或中間件。

中間件可以處理日誌請求中發送靜態文件來設置HTTP頭部的任務。第一個在你應用程序中使用的中間件是一個日誌紀錄器──它用於紀錄你Server接收到的每個request請求。當這個日誌紀錄器完成紀錄，它將鏈式調用下一個中間件函數。下一個中間件函數的作用是進行用戶驗證。如果他們訪問了一個禁止訪問的URL，那麼就會響應一個"缺少權限"的頁面。如果頁面是允許用戶訪問的，他們就可以繼續鏈式進行到下一個函數。下一個函數可能會返回一個主頁或是其他頁面。

![](http://i.imgur.com/6AR2e53.png)

中間件最大特點是它的相對標準化。及意味著很多人相繼在Express使用中間件進行開發(包括Express團隊)。有的中間件用來編譯像LESS和SCSS一樣的靜態資源；有的中間件用於安全和權限控制；有的中間件用來解析cookies和session。

### 路由

路由跟中間件相似的是，它將一個集成的request請求處理函數分解成單個獨立的小模塊。跟中間件不同的是，這些請求的執行是有條件的，依據的是**URL**以及**客戶端發送的HTTP方式**。

路由允許你透過**路徑劃分你的應用程序的行為**。

路由的行為，用一個request請求處理函數定義。

Express應用有中間件和路由；它們是相輔相成的。就比如，你可能想記錄所有的request請求，但你又想在用戶請求主頁的時候返回它的時候。

### 子應用

子應用。用Express方式來說，這些小的應用程序被稱為路由。

Express允許你定義路由用於大型應用程序。編寫這些子應用簡直跟編寫別的正常應用一樣，但是它允許你更進一步的把你應用程序分為小模塊。在你的應用程序中可能有一個管理面板，而其他的函數則在你的應用程序中起到不同的作用。你可以設置控制面板的代碼使得你其餘的中間件和路由同時進行，但是你同樣可以為你的控制面板創建一個子應用。

![](http://i.imgur.com/Om9JuzU.png)

這個特性的優點只有在你的應用程序規模變大的時候才能體現出來。

### 便捷函數

Express應用程序是由中間件和路由組成的，它們中的任意一個都由你來編寫request請求處理函數，所以你可以做很多事情!

為了使這些request請求處理函數更加的易用，Express新增了一些細節。例如某一個文件夾發送一個JPEG文件，在Express中，你只需要調用一個sendFile方法。Express擁有很多能夠更容易渲染HTML的功能參數。Express還有很多的功能函數用於是你更容易的解析到來的request請求，比如抓取客戶端的IP地址。

跟之前的特性不一樣，這些便捷性不影響你如何組織你的應用程序，但它們真的超級有用。