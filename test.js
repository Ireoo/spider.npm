/**
 * Created by Ireoo on 2017/3/28.
 */

var spider = require('./spider');

// console.profile('性能分析器');
spider({
    rules: [{
        title: '破晓列表',
        url: 'http://www.poxiao.com/',
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
                        content: {
                            type: 'text',
                            text: 'div.filmcontents p'
                        }
                    }
                },{
                    list: 'div.resourcesmain table tr',
                    rule: {
                        title: {
                            type: 'text',
                            text: 'a'
                        },
                        address: {
                            type: 'val',
                            text: 'input'
                        }
                    }
                }]
            }]
        }]
    }],
    callback: function(data) {
        console.log('>>> ', data);
    },
    run: true
});
// console.profileEnd();