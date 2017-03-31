# Spider.io
网络爬虫类库,基本可以实现自定义规则大部分网站

## 使用说明
```javascript
var spider = require('spider.io');
spider({
    init: {
        debug: true, // 调试输出
        delay: 200  // 单个操作延迟
    },
    rules: [{
        title: '破晓列表',
        url: 'http://www.ffdy.cc/index.php',
        rules: [{
            list: 'div#indextopleft div ul li',
            rule: {
                url: {
                    type: 'href',
                    text: 'a'
                }
            },
            link: [{
                title: '内容',
                rules: [{
                    rule: {
                        title: {
                            type: 'text',
                            text: 'h1'
                        },
                        address: {
                            type: 'thunderhref',
                            text: 'div.resourcesmain table tbody tr td a'
                        },
                        content: {
                            type: 'text',
                            text: 'div.filmcontents p'
                        }
                    }
                }]
            }]
        }]
    }],
    callback: function(data) {
        console.log(data);
    },
    run: true  //立即运行
});
```
OR
```javascript
var spider = require('spider.io');
spider({
    init: {
        debug: true, // 调试输出
        delay: 200  // 单个操作延迟
    },
    callback: function(data) {
        console.log(data);
    }
}).run([{
    title: '破晓列表',
    url: 'http://www.ffdy.cc/index.php',
    rules: [{
        list: 'div#indextopleft div ul li',
        rule: {
            url: {
                type: 'href',
                text: 'a'
            }
        },
        link: [{
            title: '内容',
            rules: [{
                rule: {
                    title: {
                        type: 'text',
                        text: 'h1'
                    },
                    address: {
                        type: 'thunderhref',
                        text: 'div.resourcesmain table tbody tr td a'
                    },
                    content: {
                        type: 'text',
                        text: 'div.filmcontents p'
                    }
                }
            }]
        }]
    }]
}]);
```

## 参数说明
