# chap11. 部署：資源和Heroku

>**本章涵蓋**  
>用Browserify來打包JavaScript，從而使你的代碼可以在客戶端和Server端復用  
>用connect-assets來取代用Grunt來編譯和提供CSS，JavaScript的方式  
>將你的應用程序部署到Heroku來體驗真實的網絡環境

如果你正在編寫某種類型的網站，這時你很可能需要提供CSS和JavaScript。通常出於性能的考慮你會將資源進行整合壓縮。我們通常會編寫CSS編譯語言(SASS和LESS)，就像我們編寫Javascript編譯語言(CoffeeScript或TypeScript)，或對Javascript進行整合壓縮一樣。這裡會告訴你如何選出特定工具來為你的web打包資源。

部署到網際網路：簡單並且免費的Heroku。你將給你的app添加一些小東西並將Express app部署到網路中。

你學習了本章知識後，你將：

- 利用LESS預處理使你CSS開發更加便捷
- 利用Browserify讓你可以在瀏覽器端中就像在Node中一樣用require
- 盡可能壓縮你的資源文件
- 使用Grunt來編譯以及處理更多的事情
- **使用Express中間件(connect-asserts)來取代Grunt工作流**
- 了解如何將Express應用程序部署到Heroku

## 使用LESS快樂編寫CSS

Node.js很強有力，但他的語法有些笨重且存在一定的拘限性。這就是Express出現的原因——它沒有本質上改變Node；而是平滑化Node。

LESS和CSS之間的關係有點像Express和Node的關係。LESS沒有從本質上改變CSS；而是平滑化CSS。

利用一定數量的變數來取代硬編碼的值，從而減少重複的代碼。變數存在於LESS而不是CSS。LESS擴展了CSS並添加了很多強有力的特性。

和Express不一樣，LESS是一門獨立的語言。這就意味著它必需編譯成CSS，以便你可以在web瀏覽器中使用它——瀏覽器只會說CSS。

你可訪問[http://less2css.org/](http://less2css.org/)來體驗LESS。

![](http://i.imgur.com/gYOEbur.png)

LESS有很多的特性，不過它有5個關鍵點：

- 變數。允許你在一處把顏色或其他的值定義為變數並在多處使用到它。
- 函數。允許你對變數進行操作(例如，條件顏色的暗度為10%)。
- 嵌套選擇器。允許你像HTML一樣結構化你的樣式表而減少重複代碼。
- 混合。允許你定義可重複組件並在各種選擇器中使用它們。
- 引入。允許你將樣式表分隔為多文件。

更多細節：[http://lesscss.org/](http://lesscss.org/)。

### 變數

假設你想要把你站點的主色調定義為`#FF9900`：

```
@primary-color: #ff9900;

.logo {
    color: @primary-color;
    font-weight: bold;
}
a {
    color: @primary-color;
}
```

生成的CSS代碼：

```
.logo {
  color: #ff9900;
  font-weight: bold;
}
a {
  color: #ff9900;
}
```

這樣，如果你想要變更你網站的主色調，你只需要做一處改動就可以了：頂部的變數。

任何有效的CSS在LESS中都是有效的(而不是被其他的方法左右著)。你可輕鬆將現有的CSS改善為LESS，同時一切依然會正常運作。

### 函數

LESS中同樣擁有函數，函數可以使你像Javascript編程語言一樣操縱變數。跟傳統編程語言類似，會有很多內置函數可以幫你排憂解難。然而，跟傳統編程語言不一樣的是，這些函數都是內置在語言中的。你不能自己定義他們；你必須使用另一個被稱為混合的特性。

LESS有很多可以讓你操作顏色的函數。例如，想像你的連結有一個基色。當你懸停在它們上面的時候，它們會變得更亮。當你點擊它們時，他們會變得更暗。LESS中，函數和變數使得這很容易實現，就像下一個代碼清單所示：

```
@link-color: #0000ff;

a {
  color: @link-color;
}
a:hover {
  // 讓連結顏色變亮25%
  color: lighten(@link-color, 25%);
}
a:active {
  // 讓連結顏色變暗20%
  color: darken(@link-color, 20%);
}
```

LESS編譯成CSS後：

```
a {
  color: #0000ff;
}
a:hover {
  color: #8080ff;
}
a:active {
  color: #000099;
}
```

LESS還有許多其他內置函數：[http://lesscss.org/functions/](http://lesscss.org/functions/)。

### 混合(Mixins)

透過mixins來定義可以重複CSS聲明，之後你可在樣式表中使用它們。

假設最常見的例子是添加廠商前綴。如果你想使用CSS的border-radius屬性，你必須給它加上前綴從而確保它可在Chrome、Firefox、IE、Safari等瀏覽器中工作。

```
.my-element {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    border-radius: 5px;
}
```

在LESS中，不需要定義border-radius然後編寫廠商前綴副本。你可定義一個mixin，或一個你可多次聲明的可重用組件。

```
// 定義border-radius的mixin
.border-radius(@radius) {
  -webkit-border-radius: @radius;
     -moz-border-radius: @radius;
      -ms-border-radius: @radius;
          border-radius: @radius;
}
.my-element {
  // 使用border-radius mixin
  .border-radius(5px);
}
.my-other-element {
  // 使用border-radius mixin
  .border-radius(10px);
}
```

現在，你透過編譯器運行LESS，產生的CSS：

```
.my-element {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    border-radius: 5px;
}
.my-other-element {
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    -ms-border-radius: 10px;
    border-radius: 10px;
}
```

mixin擴展了冗長的廠商前綴聲明，它可讓你不用在每次使用的時候都編寫他們。

### 嵌套

在HTML中，你的元素是可以嵌套的。所有的東西都包含在`<html>`標籤中，緊接著你的內容被包含在`<body>`標籤中。在body中，你可以編寫一個帶有`<nav>`的`<header>`來做導航。CSS不能完全反映這點：如果你想為你的頭部以及頭部中的導航編寫樣式，CSS：

```
header {
  background-color: blue;
}
header nav {
  color: yellow;
}
```

利用LESS，可以將代碼清單改善為：

```
header {
  background-color: blue;
  // nav的樣式在另一個選擇器的內部
  nav {
    color: yellow;
  }
}
```

LESS改善了CSS並讓其支持了嵌套規則。這意味代碼可以變得更短，可讀性變更強，並且**能更好反映你的HTML**。

#### 嵌套父選擇器

嵌套規則可以讓它們關聯父元素。連結和它們的懸浮狀態就是一個很好的例子。你可能有一個選擇器用於a、a:visited、a:hover、以及a:active。在CSS中，你可能要用到四個獨立的選擇器。LESS中，你定義一個外部選擇器和三個內部選擇器：

```
a {
  color: #000099;
  // 利用&符號關聯到父選擇器
  &:visited {
    color: #330099;
  }
  &:hover {
    color: #0000ff;
  }
  &:acive {
    color: #ff0099;
  }
}
```

LESS可以簡單的嵌套你的選擇器從而匹配你的HTML，不過它同樣可以對父選擇器進行嵌套。

### 引入(include)

樣式多，對CSS來說，你可將代碼拆分為多文件，不過這種做法會導致多HTTP請求帶來的性能問題。

LESS允許你將樣式分隔為多文件，在編譯的時候所有的文件會連接為一個CSS文件，從而提升性能。開發者可將變數和mixin分離單獨的文件中，從而讓代碼更加模組化。你同樣可為主頁編寫一個LESS文件，為用戶頁編寫一個LESS文件，以此類推。

這語法十分的簡單：

```
// 引入同一個文件夾中的other-less-file.less
@import "other-less-file"
```

### LESS的替代品

此時此刻，這應該已經不足為奇了：有不只一種的方法來進行CSS預處理。房子中的大象是LESS最大的競爭對手Sass。Sass跟LESS十分的相似；它們都有變數、mixins、嵌套選擇器、引入，同時可以集成到Express。就語言來說，它們十分相似。Sass並不起緣於Node項目，不過他十分流行並且他為了便融入到Node世界自身做了扎實的動作。你可在[http://sass-lang.com/](http://sass-lang.com/)查看到。

LESS和Sass他們有同樣的基本概念和集成到Express的方式。

也有將未來版本編譯為當前版本的預處理器：Myth和cssnext。

## 利用Browserify讓你在瀏覽器中可以require模組

簡單來說，Browserify ([http://browserify.org/](http://browserify.org/))是一個JavaScript打包工具，它允許你像Node中同樣使用require函數。

Browserify用一種聰明的方式解決了模組的問題：它讓你就像在Node中這樣require模組(對比RquireJS這樣異步且需要醜陋異步請求的東西)。它之所以那麼強大是出於兩個原因：

- 它使你可以很容易的定義一個模組。如果Browserify發現*evan.js*引入*cake.js*和*burrito.js*，它就會打包*cake.js*和*burrito.js*，再將它們連接之後編譯到輸出文件中。

- 它跟Node模組幾乎完全一致。這是一件大事——基於Node的和基於瀏覽器的JavaScript都可以引入Node模組，這使得你可以在不用做任何額外工作的前提下，可以在**Server和Client間代碼複用**。你甚至可以**在browser中引入很多Node的原生模組**，以及很多像`__dirname`這樣Node特有的東西。

讓我來向你展示它吧！

### 一個簡單的Browserify示例

假設你想編寫一個生成隨機顏色來設置背景的web頁面。也許你想為下一個配色方案找到靈感。

你將會用到random-color([https://www.npmjs.com/package/random-color](https://www.npmjs.com/package/random-color))這個npm模組，來生成隨機的RGB顏色字符串。如果你看了這個模組的源碼，你就會發現它對瀏覽器一無所知——它只是為Node模組系統而設計的。

我們新建資料夾。然後編寫*package.json*：

```
{
  "name": "browseify-test",
  "private": true,
  "scripts": {
    "build-my-js": "browserify main.js -o compiled.js"
  },
  "dependencies": {
    "browserify": "^14.4.0",
    "random-color": "^1.0.1"
  }
}
```

創建一個*main.js*：

```
var randomColor = require('random-color');

document.body.style.background = randomColor();
```

最後，用下面的內容在同一個文件夾定義一個簡單的HTML文件*index.html*：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
<script src="compiled.js"></script>
</body>
</html>
```

接著執行npm run build-my-js。在web中打開你剛編寫的HTML文件，每次刷新都可看到隨機生成的顏色。

可打開compiled.js看隨機顏色模組的代碼。這些代碼十分醜陋：

[./browserify-test/compiled.js](./browserify-test/compiled.js)

這些文件透過Browserify的包裝模擬了Node的模組系統，不過他們有點...重要的是他們工作了！你現在可以在瀏覽器中使用Node模組了。

>**注意** 儘管你可以引入很多實用的庫(甚至是內置的)，有很多東西是你不能在瀏覽器中模擬出來的，因此你沒法在Browserify中使用它們。例如，你不能在瀏覽器中運行web server，所以很多的http模組是被禁止的。不過像一些util或者你自己編寫的模組是完全可以使用的！

就像你利用Browserify編寫你的代碼一樣，你想要一個更棒的方式在命令行中進行每一次構建的編寫。讓我們一起學習一個工具，並讓它幫助你使用Browserify，LESS等等。

## 使用Grunt來編譯、壓縮，還有更多

我們已經見過LESS和Browserify了，但我們還沒有發現一種能將它們優雅集成到我們Express app的方式。

我們將利用Grunt和connect-asserts這兩個工具來處理這個問題。Grunt([https://gruntjs.com/](https://gruntjs.com/))自稱“任務運行者”，就像他所說那樣：它運行任務。

Grunt給你定義了一個框架讓你來定義任務。跟Express相似，Grunt也是一個小型框架。
它本身並不能做太多事情；你需要安裝和配置其他任務來讓Grunt運行。你可以在[https://gruntjs.com/plugins](https://gruntjs.com/plugins)看到所有任務的清單，但你今天只會用到四個：

- 利用Browserify來編譯和連接Javascript
- 將LESS編譯為CSS
- 壓縮Javascript和CSS
- 利用watch讓你從一次次的命令行打印中脫離出來

讓我們安裝Grunt開始。

### 安裝Grunt

這邊不全局安裝grunt，這樣可以在系統中安裝多個版本的Grunt。

*package.json*：

```
{
  "name": "grunt-test",
  "private": true,
  "scripts": {
    "grunt": "grunt"
  }
}
```

接下來安裝：

```
npm install grunt grunt-cli --save-dev
```

然後，你將創建一些被稱為Gruntfile的東西，Grunt將會檢查它們並決定做什麼事情。Gruntfile存在於你項目的根目錄並被命名為Gruntfile.js。

下一個代碼清單Gruntfile的Hello World，當你運行Grunt，它就會檢查Gruntfile，找到相應的任務，並運行內部代碼：

```
module.exports = (grunt) => {
    grunt.registerTask('default', 'Say Hello World', () => {
        grunt.log.write('Hello world!');
    });
};
```

在你終端中打入`npm run grunt`，你將會看到如下輸出：

```
Running "default" task
Hello world!
Done.
```

可查看本書中的示例代碼：[https://github.com/EvanHahn/Express.js-in-Action-code/tree/master/Chapter_11/grunt-examples](https://github.com/EvanHahn/Express.js-in-Action-code/tree/master/Chapter_11/grunt-examples)。

### 利用Grunt編譯LESS

*my_css/main.less*：

```
article {
  display: block;
  h1 {
    font-size: 16pt;
    color: #900;
  }
  p {
    line-height: 1.5em;
  }
}
```

這些代碼會被轉換為下面代碼CSS：

```
article {
    display: block;
}
article h1 {
    font-size: 16pt;
    color: #900;
}
article p {
    line-height: 1.5em;
}
```

如果你將CSS進行壓縮的話，它看起來就是下一個代碼清單這樣：

```
article{display: block}article h1{font-size:16pt; color:#900}article p{lineheight:1.5em}
```

你可使用一個Grunt的第三方LESS任務來做到這些！從運行`npm i grunt-contrib-less --save-dev`安裝Grunt的LESS任務開始。接下來，添加代碼到*Gruntfile.js*：

```
module.exports = (grunt) => {
    // 為你的每個Grunt任務配置設置
    grunt.initConfig({
        // 為你的LESS任務定義配置
        less: {
            // 告訴Grunt的LESS插件將my_css/main.less編譯到tmp/build/main.css
            main: {
                options: {
                    paths: ['my_css']
                },
                files: {
                    "tmp/build/main.css": "my_css/main.less"
                }
            }
        }
    });

    // 載入Grunt的LESS插件
    grunt.loadNpmTasks('grunt-contrib-less');

    // 當你在執行命令行運行grunt的時候，告訴Grunt運行LESS編譯任務
    grunt.registerTask('default', ['less']);
};
```

當你用`npm run grunt`運行Grunt的時候，你的LESS就會被編譯到*tmp/build/main.css*。

### 提供這些編譯的資源

現在你已經編譯了所有的東西，你需要將它提供給你的訪客了！你將利用Express靜態中間件來做這件事情。將tmp/build添加為你中間件棧的一部分：

```
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, 'tmp/build')));

app.listen(3000, () => console.log('App started on port 3000.'));
```

現在你可從public中提供文件並從tmp/public中提供編譯好之後的文件。

>**注意** 你可能並不想將編譯後的文件提交到你的倉庫，所以你將它們儲存到一個目錄之下，以便之後你可以用版控工具忽略它們。

### 利用Grunt來使用Browserify

明智的Browserify有著Grunt集成，所以你可以自動化客戶端JavaScript代碼編譯過程。

`npm i grunt-browserify --save-dev`來進行安裝，接著在Gruntfile.js添加如下代碼：

```
module.exports = (grunt) => {
    // 為你的每個Grunt任務配置設置
    grunt.initConfig({
        // 為你的LESS任務定義配置
        less: {
            /* ... */
        },
        browserify: {
            // 從my_javascripts中編譯main.js到tmp/build/main.js
            client: {
                src: 'my_javascripts/main.js',
                dest: 'tmp/build/main.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    // 載入grunt-browserify任務
    grunt.loadNpmTasks('grunt-browserify');

    // 當你在執行命令行運行grunt的時候，告訴Grunt運行Browserify和LESS編譯任務
    grunt.registerTask('default', ['browserify', 'less']);
};
```

現在，當你用npm run grunt運行Grunt的時候，將會編譯my_javascripts/main.js到tmp/build/main.js。加上前面設置的LESS，你現在可以提供服務了。

### 利用Grunt壓縮Javascript

UglifyJS是一個流行的Javascript壓縮工具，它可把你的代碼壓縮到很小的尺寸。你將使用grunt-contrib-uglify的Grunt任務，從而利用UglifyJS來壓縮已經被Browserify處理過的代碼。你可在[https://www.npmjs.com/package/grunt-contrib-uglify](https://www.npmjs.com/package/grunt-contrib-uglify)查看更多。

`npm i grunt-contrib-uglify --save-dev`。接著下面代碼加到*Gruntfile.js*：

```
module.exports = (grunt) => {
    grunt.initConfig({
        less: {
            /* ... */
        },
        browserify: {
            /* ... */
        },
        // 將前面編譯好的Javascript文件編譯成壓縮版本
        uglify: {
            myApp: {
                files: {
                    'tmp/build/main.min.js': ['tmp/build/main.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['browserify', 'less']);
    // 當你輸入npm run grunt build的時候進行構建
    grunt.registerTask('build', ['browserify', 'less', 'uglify']);
};
```

執行`npm run grunt build`，你將會同時運行Browserify任務和Uglify任務。現在你的Javascript已經被壓縮了。

### 使用Grunt監測

有一個Grunt任務可以監測你的文件，每次文件發生改變的時候返回任意的Grunt任務。讓我們透過使用`grunt-contrib-watch`，在任意CSS和Javascript發生改變的時候進行自動編譯。

`npm i grunt-contrib-watch --save-dev`安裝任務，接著填入Gruntfile代碼：

```
module.exports = (grunt) => {
    grunt.initConfig({
        less: {
            /* ... */
        },
        browserify: {
            /* ... */
        },
        uglify: {
            /* ... */
        },
        watch: {
            // 告訴Grunt在每次.js文件發生改變的時候運行Browserify任務
            scripts: {
                files: ['**/*.js'],
                tasks: ['browserify']
            },
            // 告訴Grunt在每次.less文件發生改變的時候運行LESS任務
            styles: {
                files: ['**/*.less'],
                tasks: ['less']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // 註冊一個新的任務來監測你的文件變化
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['browserify', 'less']);
    grunt.registerTask('build', ['browserify', 'less', 'uglify']);
};
```

現在，當你運行npm run grunt watch，Grunt就會監測你的文件並按需編譯你的CSS/Javascript。強烈推薦你使用它。

### 其他有幫助的Grunt任務

這有一些可能會在某一時候有幫助：

- grunt-contrib-sass
- grunt-contrib-requirejs
- grunt-contrib-concat：連接文件，雖技術含量不高，但卻很流行用它來解決很多問題。
- grunt-contrib-imagemin：壓縮圖片。如果你想節省商標寬度，這是個好工具。
- grunt-contrib-coffee：讓你可在客戶端用CoffeeScript來取代Javascript。

## 使用Connect-asserts來編譯LESS和CoffeeScript

