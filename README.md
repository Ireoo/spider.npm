# Spider.io
网络爬虫类库,基本可以实现自定义规则大部分网站

## 最新更新
> 1.添加线程处理

## 使用说明
```javascript
var spider = require('spider.io');
spider({
    init: {
        debug: true,    // 调试输出
        delay: 200,     // 单个操作延迟
        timeout: 1000,  // 访问超时
        threads: 10     // 启动线程
    },
    links: [{
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
            links: [{
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
        debug: true,    // 调试输出
        delay: 200,     // 单个操作延迟
        timeout: 1000,  // 访问超时
        threads: 10     // 启动线程
    },
    callback: function(data) {
        console.log(data);
    }
}).run([{
    title: '破晓列表',
    url: 'http://www.ffdy.cc/index.php',
    links: [{
        list: 'div#indextopleft div ul li',
        rule: {
            url: {
                type: 'href',
                text: 'a'
            }
        },
        links: [{
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