# Spider.io

![](https://img.shields.io/npm/v/spider.io.svg)
![](https://img.shields.io/npm/dm/spider.io.svg)

极简网络蜘蛛爬虫，适用任何网站，只需设置一条规则，就可以把你想要网站上的内容整理出来，非常方便，简单！

## 最新更新

### v5.0.7 [2019/7/7]

1. 修复程序无法识别多条规则，导致每次只显示最后一条的问题

### v5.0.6 [2018/11/21]

1. 修复因为无法解析网页内容导致程序终止

### v5.0.3 [2018/11/18]

1.  修复程序无法成功启动问题

### v5.0.0 [2018/4/14]

1.  弃用 crawler.js, 改用 superagent 模块
1.  增加 debug 颜色分类
1.  重构代码

### v4.2.7

1.  新添加 rules.cb 函数，处理复杂的值，最后一定要用 return 返回
1.  优化核心程序，能够访问更多的网页
1.  增加完成操作'done'返回函数
1.  添加线程处理
1.  修改规则
1.  添加一些规则示例（在 test 目录）使用时不设置 links 将自动运行示例

## 使用说明

```code
npm install spider.io --save
```

```javascript
const Spider = require("spider.io");
new Spider({
  callback: function(hash, data) {
    console.log(hash, data);
  },
  run: true //立即运行
});
```

OR

```javascript
const Spider = require("spider.io");
new Spider({
  callback: function(hash, data) {
    console.log(hash, data);
  }
}).run();
```

## 参数说明

### 参数格式如下

```javascript
const options = {
  init: {
    debug: false,
    delay: 1000,
    timeout: 5000,
    retrys: 3,
    threads: 1,
    loop: false
  },
  links: {
    title: "",
    hash: "",
    url: "",
    rules: {
      list: "a",
      rule: {
        url: {
          // 同级包含links的，必须有此参数
          type: "href",
          text: ""
        },
        title: {
          type: "text",
          text: ""
        }
      },
      links: [],
      cb: $ => {
        // $ -> 为格式化的dom对象，可以直接操作，语法规则请查看 jQuery
        // ...code
        // 如果同级包含links，必须要有返回值，并且要包含url；可以返回 array 或 object
        // return [{url: ''}] or {url: ''};
      }
    }
  },
  callback: (hash, data) => {
    // 数据以单条记录返回，并不会一次返回所有值
  },
  done: () => {
    // 全部处理完毕后回调该函数
  }
};
```

### init (主参数）

| 参数名  | 使用说明                                          | 默认值 |
| :------ | :------------------------------------------------ | :----: |
| debug   | 输出调试信息，包括（网站访问时间，网站访问的内容) | false  |
| delay   | 设置每个网站之间访问延迟                          |  1000  |
| timeout | 设置网站访问超时时间                              |  5000  |
| retrys  | 设置网站访问重试次数                              |   3    |
| threads | 设置线程数                                        |   1    |
| loop    | 结束后是否自动重新开始                            | false  |

### headers (主参数）(具体说明请查看 [superagent](https://www.npmjs.com/package/superagent)）

### links (主参数）

| 参数名 | 使用说明                                                                             | 类型         | 必须 |
| :----- | :----------------------------------------------------------------------------------- | :----------- | :--: |
| title  | 用于说明规则的作用                                                                   | text         |  ×   |
| hash   | 用作识别码，在 callback 中完全返回                                                   | 不限制       |  ×   |
| url    | 访问的网址                                                                           | text/array   |  √   |
| rules  | 应用于当前网址的规则                                                                 | array/object |  √   |
| max    | 当 url 中包含{i}时，设置 i 的最大值                                                  | number       |  ×   |
| min    | 当 url 中包含{i}时，设置 i 的最小值, 设置此值必须要设置 max，此默认值：1             | number       | ×    |

#### rules

| 参数名 | 使用说明                                                       | 类型         | 必须 |
| :----- | :------------------------------------------------------------- | :----------- | :--: |
| list   | 设置列表开始地址                                               | text         |  ×   |
| rule   | 设置获取的内容                                                 | array/object |  ×   |
| links  | 对于上一层的循环事件中连接另一规则                             | array/object | ×    |
| cb     | 直接用函数操作，必须要返回值，\$为格式化网站内容，必须要返回值 | function(\$) |  ×   |

##### rule （使用 jquery 选择器规则）

| 参数名 | 使用说明                                 | 类型 |
| :----- | :--------------------------------------- | :--- |
| key    | 返回值为\<key>\<text>位置的\<type>属性值 | text |

使用方法：

```javascript
{
    <key>: {
        type: 'text|val|html|href|src|....', //可以自己设置属性
        text: ''                             //对于循环事件中，可以不设置值
    }
}
```

##### links

在使用 links 时，此规则中必须包含 list，并且 rule 中必须包含\<key>为 url<br>
在连接的规则中会自动将列表中获取的 url，对 links 的 url 逐个替换，生成新的规则。

### callback (主参数）

获取数据后的返回函数，返回值：

| 参数名 | 使用说明                                                    |  类型  |
| :----- | :---------------------------------------------------------- | :----: |
| hash   | 返回该条规则中设置的 hash，不做处理，直接返回，用作规则识别 | 不限制 |
| data   | 逐个返回最后一层获取的数据                                  |  json  |
