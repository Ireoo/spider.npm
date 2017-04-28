/**
 * Created by ultra on 2017/4/26.
 */
"use strict";

var Spider = require('./spider.js');

 var spider = new Spider({
    init: {
        debug: true,
        timeout: 3000,
        threads: 1,
        delay: 3000
    },
    links: [{
        title: '爱奇艺列表',
        url: 'http://tvinke.com/forum-96-1.html',
        rules: [{
            list: 'table#threadlisttableid tbody',
            rule: {
                url: {
                    type: 'href',
                    text: 'th.new a.s.xst'
                },
                title: {
                    type: 'text',
                    text: 'th.new a.s.xst'
                }
            },
            links: [{
                title: '爱奇艺内容',
                rules: [{
                    rule: {
                        title: {
                            type: 'text',
                            text: 'h1.ts span#thread_subject'
                        }
                    }
                }]
            }]
        }]
    }],
    callback: function(data) {
        console.log('>>> ', JSON.stringify(data));
    },
    run: true
});