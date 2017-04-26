# Spider.io
网络爬虫类库,基本可以实现自定义规则大部分网站

## 最新更新
> 1.添加线程处理<br>
> 2.修改规则<br>
> 3.添加一些规则示例（在test目录）使用时不设置links将自动运行示例

## 使用说明
```javascript
var spider = require('spider.io');
spider({
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
    callback: function(data) {
        console.log(data);
    }
}).run();
```

## 参数说明
### init (主参数）
|参数名|使用说明|默认值|
|:---|:---|:---:|
|debug|输出调试信息，包括（网站访问时间，网站访问的内容)\[false, true, html\]|false|
|delay|设置每个网站之间访问延迟|3000|
|timeout|设置网站访问超时时间|3000|
|threads|设置线程数|10|

### headers (主参数）(具体说明请查看 [needle](https://www.npmjs.com/package/needle#http-header-options)）

### links (主参数）
|参数名|使用说明|类型|必须|
|:---|:---|:---|:---:|
|title|用于说明规则的作用|text|×|
|url|访问的网址|text|√|
|rules|应用于当前网址的规则|array|√|

#### rules
|参数名|使用说明|类型|必须|
|:---|:---|:---|:---:|
|list|设置列表开始地址|text|×|
|rule|设置获取的内容|array|√|
|links|对于上一层的循环事件中连接另一规则|array|×|

##### rule （使用jquery选择器规则）
|参数名|使用说明|类型|
|:---|:---|:---|
|key|返回值为\<key>\<text>位置的\<type>属性值|text|

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
在使用links时，此规则中必须包含list，并且rule中必须包含\<key>为url<br>
在连接的规则中会自动将列表中获取的url，对links的url逐个替换，生成新的规则。

### callback (主参数）
获取数据后的返回函数，返回值：

|参数名|使用说明|类型|
|:---|:---|:---:|
|data|如果第一层为列表，并且包含links时，逐个返回第二层获取的数据；否则返回第一层的列表数据|json|