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
userSchema.methods.name = () => {
    return this.displayName || this.username;
};
```

密碼儲存要確保安全，使用bcrypt程序來應用單向散列Hash。Bcrypt透過多次運行部分算法來為你提供一個安全的散列，不過運行次數是可配置的。數值越大，它的安全性就越強但相應的獲取時間也會變長。正如下面的代碼清單所示，你把數值設為10，可增加數值來獲取更高的安全性。

```
const bcrypt = require('bcrypt-nodejs');
const SALT_FACTOR = 10;
```

在你定義你的模式後，你將定義預儲存動作。在你模型儲存到資料庫之前，你將運行這些代碼來散列化密碼。

```
// 一個用於提供給用戶bcrypt的模組空函數
const noop = function () {
};

// 定義一在模型保存前運行的函數
userSchema.pre('save', function (done) {
    // 儲存當前用戶的引用
    var user = this;
    // 如果密碼沒有被修改過的話跳過處理邏輯
    if (!user.isModified('password')) {
        return done();
    }
    // 根據salt生成對應的散列，一旦完成則調用內部函數
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return done(err);
        bcrypt.hash(user.password, salt, noop,
            // 散列化用戶的密碼
            function (err, hashedPassword) {
                if (err) return done(err);
                // 儲存密碼並繼續進行保存
                user.password = hashedPassword;
                done();
            }
        );
    });
});
```

它會在你每次將模型保存到Mongo中自動進行。

你需要編寫代碼來對真實密碼和猜測密碼進行比較。當用戶登陸的時候，你將需要確保他們輸入的密碼是正確的。下面的代碼清單在模型中定義了另一簡單的方法來做到這點。

```
userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};
```

現在你已經可以安全儲存你的用戶密碼了。

我們使用`bcrypt.compare`而不是簡單的相等檢查(利用===)。這是出於安全原因──它幫助我們安全的進行比較，從而避開駭客不時的攻擊。

一旦你定義有自己屬性和方法的模式，你就需要將模式附加到實際的模型上了。你只需要一行代碼就能做到這些，由於你要在一個文件中定義用戶模型，你需要確保module.exports暴露它，從而使得其他文件可以require它。

```
let User = mongoose.model('User', userSchema);
module.exports = User;
```

以下是*user.js*全貌：

```
const mongoose = require('mongoose');

const bcrypt = require('bcrypt-nodejs');
const SALT_FACTOR = 10;

let userSchema = mongoose.Schema({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    createdAt: {type: Date, default: Date.now},
    displayName: String,
    bio: String
});

userSchema.methods.name = function() {
    return this.displayName || this.username;
};

// 一個用於提供給用戶bcrypt的模組空函數
const noop = function () {
};

// 定義一在模型保存前運行的函數
userSchema.pre('save', function (done) {
    // 儲存當前用戶的引用
    var user = this;
    // 如果密碼沒有被修改過的話跳過處理邏輯
    if (!user.isModified('password')) {
        return done();
    }
    // 根據salt生成對應的散列，一旦完成則調用內部函數
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return done(err);
        bcrypt.hash(user.password, salt, noop,
            // 散列化用戶的密碼
            function (err, hashedPassword) {
                if (err) return done(err);
                // 儲存密碼並繼續進行保存
                user.password = hashedPassword;
                done();
            }
        );
    });
});

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

let User = mongoose.model('User', userSchema);
module.exports = User;
```

### 使用你的模型

*app.js*：

```

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

// 把你的路由放到另一個文件
const routes = require('./routes');

const app = express();

mongoose.connect(require('./credentials').mongo.connectionString);

app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 使用四個中間件
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(routes);

app.listen(app.get("port"), () => {
    console.log('Server started on port ' + app.get('port'));
});
```

*routes.js*：

```

const express = require('express');

const User = require('./models/user');

const router = express.Router();

router.use((req, res, next) => {
    // 為你的模板設置幾個有用的變數
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});

router.get('/', (req, res, next) => {
    // 查詢用戶集合，並且總是先返回新的用戶
    User.find()
        .sort({createdAt: 'descending'})
        .exec((err, users) => {
            if (err) return next(err);
            res.render('index', {users: users});
        });
});

module.exports = router;
```

首先你使用Mongoose的`mongoose.connect`連接到你的Mongo資料庫。

其次，透過`User.find`獲取用戶列表。接著你按照createdAt屬性對這些結果進行排序，再後來你透過exec進行查詢。實際上你並不會在執行exec之前進行查詢。如你所見，你同樣可以在find中指定一個callback來跳過使用exec，但這樣的話你就不能進行排序或者其他類似的事情了。

再來是創建文件了。

`views/_header.ejs`：

```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Learn About Me</title>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
    <!--[if lt IE 9]>
    <script src="//cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body>

<div class="navbar navbar-default navbar-static-top" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <a href="/" class="navbar-brand">Learn About Me</a>
        </div>
        <!--
        如果用戶已經登陸了則對導航條進行相應的改變。
        一開始你的代碼中並不存在currentUser，所以總會顯示一個狀態
        -->
        <ul class="nav navbar-nav navbar-right">
            <% if (currentUser) { %>
            <li><a href="/edit">Hello, <%= currentUser.name() %></a></li>
            <li><a href="/logout">Log out</a></li>
            <% } else { %>
            <li><a href="/login">Log in</a></li>
            <li><a href="/signup">Sign up</a></li>
            <% } %>
        </ul>
    </div>
</div>
<div class="container">
    <% errors.forEach(function(error) { %>
    <div class="alert alert-danger" role="alert">
        <%= error %>
    </div>
    <% }); %>
    <% infos.forEach(function (info) { %>
    <div class="alert alert-info" role="alert">
        <%= info %>
    </div>
    <% }); %>
```

不直接渲染的視圖總是起始於下划線。這是約定俗成的。你不會直接渲染header──另一個視圖可能會引入header。

接下來，*_footer.ejs*：

```

</div>

</body>
</html>
```

最後，創建index.ejs，這才是真正的主頁。它將在你渲染視圖的時候，接收你傳入的users變量。

```
<% include _header %>

<h1>Welcome to Learn About Me!</h1>

<% users.forEach(function (user) { %>

<div class="panel panel-default">
    <div class="panel-heading">
        <a href="/users/<%= user.username %>">
            <%= user.name() %>
        </a>
    </div>
    <% if(user.bio) { %>
    <div class="panel-body"><%= user.bio %></div>
    <% } %>
</div>

<% }) %>

<% include _footer %>
```

代碼保存完畢，啟動你的Mongo Server，執行npm start，然後在你瀏覽器訪問localhost:3000。

如果沒出現任何錯誤，這是極好的！這意味著你查詢了Mongo資料庫然後在這獲取了所有的用戶 — — 只是恰好這個時候沒有任何用戶而已。

現在給頁面添加兩個路由：一個用於註冊頁，還有一個用於實際登陸。為了使用它們，你需要確保你使用了body-parser中間件來解析資料。

*app.js*：

```
const bodyParser = require("body-parser");
// ...
app.use(bodyParser.urlencoded({ extended: false }));
// ...
```

設置body-parser的**extended**參數為**false**從而使得解析更加簡單的同時也更加安全。接下來代碼清單將告訴你如何將sign-up路由添加到routes.js中。

```
router.get('signup', (req, res) => {
    res.render('signup');
});

router.post('/signup',
    (req, res, next) => {
        // body-parser把username和password添加到了req.body
        let username = req.body.username;
        let password = req.body.password;

        // 調用findOne只返回一個用戶。你想在這批配一個用戶名
        User.findOne({username: username}, (err, user) => {
            if (err) return next(err);
            // 如果你找到一個用戶，你需要保證他的用戶名必須已經存在
            if (user) {
                req.flash('error', 'User already exists');
                return res.redirect('/signup');
            }
            // 透過username和password創建一個User模型的實例
            let newUser = new User({
                username,
                password
            });
            // 將新的用戶保存到資料庫中，然後繼續到下一個請求處理
            newUser.save(next);
        });
    },
    // 用戶有效性驗證
    passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));
```

剛才的代碼有效把你的新用戶保存到資料庫中。接下來透過新建*views/signup.ejs*：

```
<% include _header %>

<h1>Sign up</h1>

<form action="/signup" method="post">
    <input name="username" type="text" class="form-control" placeholder="Username" required autofocus>
    <input name="password" type="password" class="form-control" placeholder="Password" required>
    <input type="submit" value="Sign up" class="btn btn-primary btn-block">
</form>

<% include _footer %>
```

在你編寫登陸和登出前的最後一點事情就是個人檔案的視圖了，*routes.js*：

```
router.get('/users/:username', (req, res, next) => {
    User.findOne({username: req.params.username}, (err, user) => {
        if (err) return next(err);
        if (!user) return next(404);
        res.render('profile', {user: user});
    });
});
```

*profile.ejs*：

```
<% include _header %>

<!--
參考變數currentUser來判斷你的登錄狀態。不過現在它總會是false狀態
-->
<% if ((currentUser) && (currentUser.id === user.id)) { %>
<a href="/edit" class="pull-right">Edit your profile</a>
<% } %>

<h1><%= user.name() %></h1>
<h2>Joined on <%= user.createdAt %></h2>

<% if (user.bio) { %>
<p><%= user.bio %></p>
<% } %>

<% include _footer %>
```

## 透過Passport來進行用戶身份驗證

Passport是Node的身份認證中間件。它被設計出來的目的很純粹：對請求進行身份認證。Passport為你解決了很多頭疼的問題。

Passport並不會指定你如何去對用戶進行身份認證；它只是給你提供了有幫助的模板代碼。這與Express的思想類似。在本章中，我們將學習如何使用Passport對存入Mongo資料庫中的用戶進行身份認證，除此之外，Passport還同樣為Facebook、Google、Twitter，以及超過100多家的公司提供身份認證。它非常的模組化，同時也非常強力！

### 設置Passport

在你設置Passport的時候你需要做三件事情：

1. 設置Passport中間件
2. 告知Passport如何序列化以及反序列化user。代碼十分簡短，但是卻能有效地將user的session轉換成實際的user對象。
3. 告知Passport如何認證user。在這例子中，你大部分需要編寫的代碼主要是，告知Passport如何與你的Mongo資料庫交互。

#### 設置Passport中間件

在初始化Passport的時候，你需要設置三個Express官方中間件，一個第三方中間件，以及兩個Passport中間件。

- body-parser — — 解析HTML表單
- cookie-parser — — 處理從瀏覽器中獲取的cookies，它是用戶session的先決條件
- express-session — — 跨瀏覽器儲存用戶session
- connect-flash — — 展示錯誤訊息
- passport.initialize — — 初始化Passport模組
- passport.session — — 處理Passport的session

*app.js*：

```

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// ...

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    // 需要一串隨機字母序列
    secret: 'TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// ...
```

你將三個參數傳入到express-session：

- secret：允許你對所有客戶端傳來的session進行編碼。它能阻礙駭客破解你的用戶cookies。正如你發現的，它需要一串隨機字母序列
- resave：是這個中間件的必填選項。當它被設置為true，即使session沒有被修改也依然被刷新
- saveUninitialized：是另一個必填選項。它會重置未初始化的session

一旦你把他們設置完畢，你將可以準備開始下一步了：告知Passport如何從session中提取用戶。

#### 序列化及反序列化User

Passport需要知道如何序列化和反序列化。你需要將user的session轉換為一個實際的user對象。反之亦然。

>在一個標準的web應用程序中，只有發送登陸請求的時候，才對用戶進行身份認證。如果身份認證成功，將會建立一個session，並透過設置用戶瀏覽器中的cookie來對它進行維護。  
>任何後續的請求並不會包含認證信息，但取而代之的是，唯一的cookie指定了session。為了提供登入session，Passport將會從session中序列化和反序列化user實體。

為分離你的代碼，你需要定義一個名為*setuppassport.js*的新文件。這個文件將會導出一個單一的函數，用來設置Passport的東西。創建*setuppassport.js*並把它引入*app.js*：

```
// ...
const setUpPassport = require('./setuppassport');
// ...
const app = express();

mongoose.connect(require('./credentials').mongo.connectionString);

setUpPassport();
// ...
```

現在，你可以編寫你的Passport設置了。

因為所有的user模型都有一個唯一的_id屬性，你將使用它來作為憑證。告知Passport如何從用戶ID序列化和反序列化用戶：

```
const passport = require('passport');
const User = require('./models/user');

module.exports = () => {

    // serializeUser可以將一個user對象轉換為ID。
    // 不傳入錯誤，並傳入一個user對象調用done
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // deserializeUser可以將用戶ID轉換為user對象。
    // 一旦完成轉換，你需要傳入錯誤和用戶對象來調用done
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

};
```

現在，一旦session處理完畢，我們就可以處理最難的部分了：實際認證。

#### 實際認證

Passport最後一部分是設置策略(strategy)。一些策略包括如Facebook或Google網站身份驗證；你將要使用到的策略是local strategy。簡單說，這意味著身份認證是由你而定的，也就是說你必須寫一點點Mongoose代碼。

首先，引入Passport本地策略到一個名為LocalStrategy變數中(*setuppassport.js*)：

```
// ...
const LocalStrategy = require('passport-local').Strategy;
// ...
```

接下來，告訴Passport如何使用本地策略。你的身份認證代碼將經過下面幾步：

1. 用提供的用戶名來查找用戶
2. 如果用戶不存在，那麼你的用戶將不能通過身份認證；假設你會被以告知消息“不存在擁有這個用戶名的用戶”而結束。
3. 如果用戶存在，用你提供的密碼與真正的密碼進行比對。如果密碼匹配成功，則返回當前用戶。如果匹配失敗，返回“密碼錯誤”。

*setuppassport.js*：

```
// 告訴Passport使用本地策略
passport.use('login', new LocalStrategy((username, password, done) => {
    User.findOne({username}, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, {message: 'No user has that username!'});

        user.checkPassword(password, (err, isMatch) => {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid password.'});
            }
        });
    });
}));
```

如你所見，你實例化一個LocalStrategy。一旦你這麼做，你可以在任何你想要完成的時候調用`done`回調！如果找到了那麼你將返回user對象，否則將返回false。

#### 路由和視圖

最後，你需要設置余下的視圖。你也需要這些：

1. 登陸
2. 登出
3. 個人信息編輯(在你登入之後)

登入，*routes.js*：

```
// ...
router.get('/login', (req, res) => {
    res.render('login');
});
// ...
```

*login.ejs*：

```
<% include _header %>

<form action="/login" method="post">
    <input name="username" type="text" class="form-control" placeholder="Username" required autofocus>
    <input name="password" type="text" class="form-control" placeholder="Passport" required>
    <input type="submit" value="Log in" class="btn btn-primary btn-block">
</form>

<% include _footer %>
```

接下來，你為POST /login定義處理程序，我們將用它來處理Passport的身份認證。*routes.js*：

```
router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    // 如果登入失敗則透過connect-flash設置錯誤訊息
    failureFlash: true,
}));
```

`passport.authenticate`返回一個請求處理函數，這個函數式傳遞過來的並不需要你自己編寫。它根據用戶是否成功登入來使你重定向到正確的位置。

登出對Passport來說同樣是信手沾來的。你唯一要做的就是調用req.logout，這一個被添加到Passport的新函數：

```
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
```

Passport附加了req.user並且connect-flash將附加一些flash值。你前面添加了以下代碼，但現在看看他，應該會好的理解：

```
router.use((req, res, next) => {
    // 為你的模板設置幾個有用的變數
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash('error');
    res.locals.infos = req.flash('info');
    next();
});
```

現在你可以登入登出了。現在剩下編輯頁。

接下來，我們編寫一些工具中間件，用來確保user可以被身份認證。但是你無法使用這個中間件；你僅僅是定義它以便其他的路由可以使用它。你將調用ensureAuthenticated，如果你的用戶沒有通過認證你將重定向到登錄頁面，*routes.js*：

```
function ensureAuthenticated(req, res, next) {
    // 一個Passport提供的函數
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('info', 'You must be logged in to see this page.')
        res.redirect('/login');
    }
}
```

現在你將利用這個中間件來創建個人信息編輯頁。

當你GET請求這個編輯葉，你僅僅只是渲染視圖，但是你想要確保做這件事之前用戶已經被身份認證。你唯一要做的事就是將ensureAuthenticated傳入到你的路由，然後它就可以正常工作了。

```
// 確保用戶被身份認證；如果它們沒有被重定向的話則運行你的請求處理
router.get('/edit', ensureAuthenticated, (req, res) => {
    res.render('edit');
});
```

*edit.ejs*：

```
<% include _header %>

<h1>Edit your profile</h1>

<form action="/edit" method="post">
    <input name="displayname" type="text" class="form-control" placeholder="Display name" value="<%= currentUser.displayName || "" %>">
    <textarea name="bio" class="form-control" placeholder="Tell us about yourself!"><%= currentUser.bio %></textarea>
    <input type="submit" value="Update" class="btn btn-primary btn-block">
</form>

<% include _footer %>
```

現在，處理表單的POST處理程序，這同樣要通過ensureAuthenticated確保身份認證：

```
router.post('/edit', ensureAuthenticated, (req, res, next) => {
    req.user.displayName = req.body.displayName;
    req.user.bio = req.body.bio;
    req.user.save((err) => {
        if (err) return next(err);
        req.flash('info', 'Profile updated!');
        res.redirect('/edit');
    });
});
```

## 總結

Mongo是一個可以讓你儲存任意數量文檔的的資料庫。

Mongoose是一個Mongo官方提供的Node庫。它可以很好的配合Express。

為了安全的創建user帳戶，你需要確保你不會直接儲存密碼。你將使用到bcrypt模組來做這點。

你將使用Passport來對user進行身份認證，在它們真正進行操作前確保他們已經是登陸狀態。