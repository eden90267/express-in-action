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
        },
        browserify: {
            // 從my_javascripts中編譯main.js到tmp/build/main.js
            client: {
                src: 'my_javascripts/main.js',
                dest: 'tmp/build/main.js'
            }
        },
        // 將前面編譯好的Javascript文件編譯成壓縮版本
        uglify: {
            myApp: {
                files: {
                    'tmp/build/main.min.js': ['tmp/build/main.js']
                }
            }
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

    // 載入Grunt的LESS插件
    grunt.loadNpmTasks('grunt-contrib-less');
    // 載入grunt-browserify任務
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // 註冊一個新的任務來監測你的文件變化
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 當你在執行命令行運行grunt的時候，告訴Grunt運行Browserify和LESS編譯任務
    grunt.registerTask('default', ['browserify', 'less']);
    // 當你輸入npm run grunt build的時候進行構建
    grunt.registerTask('build', ['browserify', 'less', 'uglify']);
};