# chap08. 利用MongoDB持久化你的數據

>**本章涵蓋**
>
>使用Mongoose，它是一個官方提供的，用於使用Node控制資料庫的庫。  
>使用bcypt安全創建用戶帳戶  
>使用Passport為用戶提供身份認證

## 為什麼是MongoDB ?

Web應用程序儲存它們的資料到兩種類型之一的資料庫：關聯式和非關聯式。

典型的關聯式資料庫有點類似於電子表格。它們的資料是結構化的，每個項目通常是表中的一行。這有點像諸如Java這樣的強類型語言，即每個項目必須符合嚴格的要求(稱為schema)。很多關聯式資料庫可以被延伸SQL控制；你可能聽說過MySQL或SQL Server或PostgreSQL，關聯式資料庫和SQL資料庫這兩個術語通常可以互換。

非關聯式資料庫通常被我們稱作NoSQL資料庫。(NoSQL意味所有的東西都不是SQL，但它指的往往是某一類資料庫。)我喜歡設想NoSQL為不同的技術並握拳反對現狀。假設NoSQL是反對者胳膊上的紋身。無論如何，NoSQL資料庫不同於關聯式資料庫，因為通常不像表格結構。他們通常沒有SQL資料庫這麼嚴格。它們這種方式很像JavaScript；JavaScript通常很少會嚴格。總之，NoSQL資料庫比SQL資料庫更像JavaScript。

Mongo十分流行。是一個成熟的項目，出現自2007年。它十分可靠，它用高性能的C++編寫並被大量的用戶信賴。

雖然Mongo並不是JavaScript編寫的，但它原生的shell使用的是JavaScript。這意味著當你打開Mongo並在控制台運行它的時候，你透過JavaScript給它發送命令。使用一種你已經使用的語言來跟資料庫進行對話是十分棒的。

>**注意** 如果你在循有用的SQL工具，可在[http://docs.sequelizejs.com/](http://docs.sequelizejs.com/)看一下Sequelize。它給很多SQL資料庫提供了接口，同時它還擁有大量的特性。Mongoose跟Mongo關係就像Sequelize跟SQL的關係。

### Mongo是如何工作的

大多數應用程序有一個資料庫，例如Mongo。這些資料庫由server託管。一個Mongo server可以有很多的資料庫，但是通常每個應用程序只會有一個資料庫。(這些資料庫可以被複製到多個server，但你把它們當作一個資料庫對待)。

訪問資料庫，會需要一個客戶端來與Mongo server交互、查看並操作資料庫。大多數編程語言都有客戶端庫；這些庫被稱為**驅動**，它們使得你可以用你喜歡的編程語言與資料庫進行交互。

每個資料庫都會有一個或多個集合。我喜歡把**集合當作陣列**。一個blog應用程序可能會有一個blog帖子的集合，或者一個社區可能會有一個用戶檔案集合。它們類似於矩陣中的巨大列表，但是你可以比陣列更加容易的查詢它們(例如，查找集合中所有年齡大於18歲的用戶)。

每個集合都有一些文檔。雖然文檔在技術上並不以JSON的形式儲存，但是你可以認為他們採用的是這種方式；它們基本上都是有不同屬性的對象。文檔是那些例如用戶和blog帖子的東西；每個東西都是一個文檔。文檔不必擁有相同的屬性，即使他們位於同一個集合中 — — 理論上你可以有這麼一個集合，這個集合中的對象是完全不同的(雖然實踐中很少這麼用)。

文檔看起來有點像JSON，但它們在技術上採用的是**二進制JSON(Binary JSON)即BSON**。你基本不會去直接操作BSON；取而代之的是，你將會把它轉換為JavaScript對象。BSON的編碼和解碼在細節上跟JSON有一點不同。BSON還支持幾種JSON不支持的類型，例如日期，時間戳，以及未定義。

![](http://i.imgur.com/81cke3y.png)

最後，還有一點很重要：Mongo為每個文檔添加了一個獨一無二的屬性`_id`。因為這些ID是獨一無二的，如果兩個文檔擁有完全相同的`_id`那麼它們將會是同一個文檔，並且在**同一個集合中你不能儲存兩個ID相同的文檔**。

### 關於SQL用戶

如果你有關聯式SQL背景，很多Mongo的結構可以一一對應到SQL的結構。

Mongo中的文檔對應到SQL中的列紀錄。在一個有用戶應用程序中，每個用戶將對應到一個Mongo文檔或一列SQL紀錄。對比SQL，Mongo在資料庫層並沒有強制使用任何schema，所以，一個沒有姓氏或郵件地址是數字的用戶在Mongo中並不會是無效的。

Mongo中的集合對應到SQL中的表。Mongo的集合中包含了很多文檔，就像SQL中的表中包含了很多列一樣。文檔可以嵌入到其他的文檔中，這跟SQL不同 — — blog帖子可以包含括評論，這有點類似SQL中的兩張表。在一個blog應用程序中，這裡將會有一個blog帖子的Mongo集合或一張SQL表。每個Mongo集合包含很多的文檔，就像每張SQL表包含很多的列或紀錄。

Mongo中的資料庫跟SQL中的資料庫十分相似。通常，每個應用程序只有一個資料庫。

可查看官方的映射圖：[https://docs.mongodb.com/manual/reference/sql-comparison/index.html](https://docs.mongodb.com/manual/reference/sql-comparison/index.html)。

### 配置Mongo

OSX系統，不確定你要使用命令行，可使用[Monog.app](http://mongoapp.com/)。可輕鬆啟動命令痕，並且毫不費力將它關閉。

OSX系統喜歡命令行，可使用Homebrew包管理器透過簡單的`brew install mongodb`安裝mongo。如果使用MacPort，`sudo port install mongodb`將會執行這個任務。如果你沒有包管理器也不想使用Mongo.app，可以到Mongo下載頁[http://www.mongodb.org/downloads](http://www.mongodb.org/downloads)對它進行下載。

Ubuntu：[http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/)。

Debian：[http://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian/](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian/)。

其他Linux：[http://docs.mongodb.org/manual/tutorial/install-mongodb-on-linux/](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-linux/)。

如果你是Windows用戶或沒提到的OS，Mongo下載頁面會給你提供幫助。[http://www.mongodb.org/downloads](http://www.mongodb.org/downloads)。

這裡將假設你的Mongo資料庫啟動在localhost:27017/test。端口27017是默認端口，test是默認資料庫。

## 利用Node的Mongoose與Mongo交互

你需要一個能讓Mongo和Node交互的庫。

看看Mongoose就知道了([http://mongoosejs.com/](http://mongoosejs.com/))，一個官方提供的，用於讓Mongo與Node交互的庫。引用它的文檔：

>Mongoose提供了一個直接的，基於模式的解決方案用於給你的應用程序數據建模，也包含了很多內置的類型轉換、驗證、查詢構建、業務邏輯鉤子以及更多其他可以直接使用的。

換句話說，Mongoose給你帶來的並不僅是跟資料庫進行交換。你將透過創建一個帶有用戶帳戶的簡單網站來學習它的工作方式。

### 設置你的項目

你將開發一個非常簡單的設計網路應用程序。這個app讓用戶可以註冊新的個人檔案、編輯檔案，以及瀏覽所有人的檔案。你可把它稱為Learn About Me，簡稱LAM。

網站中將有這幾個頁面：

- 主頁，列出所有用戶，點擊列表用戶將跳轉到對應的用戶信息頁。
- 用戶信息頁，將會顯示用戶的顯示名稱，加入網站的日期，以及他們的個人檔案。每個用戶都可編輯他們自己的信息，不過前提是他們已經登入過了
- 一個用於註冊新帳戶的頁面
- 一個用於登入帳號的頁面
- 註冊之後，用戶可編輯他們的顯示名字及個人檔案，但前提是他們已經登入過了

package.json：

```
{
  "name": "learn-about-me",
  "private": true,
  "scripts": {
    "start": "node app"
  },
  "dependencies": {
    "bcrypt-nodejs": "0.0.3",
    "body-parser": "^1.17.2",
    "connect-flash": "^0.1.1",
    "cookie-parser": "^1.4.3",
    "ejs": "^2.5.6",
    "express": "^4.15.3",
    "express-session": "^1.15.3",
    "mongoose": "^4.11.1",
    "passport": "^0.3.2",
    "passport-local": "^1.0.0"
  }
}
```

>**BCRYPT-NODE 模塊** 此模塊用純JavaScript編寫的，所以可以十分容易的安裝它。在npm倉庫有一個叫做bcrypt的其他模組，它引用一些C代碼編譯，編譯C代碼會比純JavaScript快得多，但如果你電腦沒有正確設置編譯C的代碼，那麼它可能會導致問題。這例子中我們用bcrypt-node模組來避免這問題。

是時候往你的資料庫裡放一些東西了。

### 創建一個user模型

Mongo以BSON形式，即二進制形式儲存所有東西。一個簡單的Hello World BSON文檔內部看起來會是這樣：

```
\x16\x00\x00\x00\x02hello\x00\x06\x00\x00\x00world\x00\x00
```

電腦可為你處理那些髒活累活，但它很難可以像人類一樣進行閱讀。我們想要容易理解的東西，這也是開發者會創建資料庫模型概念的原因。模型是用於描述資料庫記錄的，它作為一個你選擇的編程模型對象。在這例子中，我們的模型就是JavaScript對象。

模型可以作為一個用來儲存資料庫值的簡單對象，但它們通常沒有數據驗證、擴展方法、以及其他的東西。正如你看到的，Mongoose有很多這樣的特性。

在這例子中，你為用戶建立一個模型。用戶對象該有這些屬性：

- 用戶名(required)
- 密碼(required)
- 加入時間
- 顯示名稱(option)
- 個人簡介

為了在Mongoose中定義它們，你必須先定義一個模式(schema)，用來包含屬性、方法，以及其他的信息。我們可以輕鬆將文字信息轉換為Mongoose代碼。

在你根目錄創建一個名為models的文件夾，並創建一個user.js的文件。

```
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    createdAt: {type: Date, default: Date.now},
    displayName: String,
    bio: String
});
```

當你需要Mongoose的時候，你可以直接的定義相應的字段。

一旦你創建了帶有這些屬性的模式，你就可以添加方法了。第一個方法，獲取用戶的名字。

```

```