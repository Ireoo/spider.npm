/**
 * Created by ultra on 2017/4/26.
 */
"use strict";

var Spider = require('./spider.js');

var spider = new Spider({
    init: {
        debug: true,
        timeout: 1000,
        threads: 10
    },
    headers: {
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    },
    // links: iqiyi,
    callback: function(data) {
        console.log('>>> ', JSON.stringify(data));
    },
    run: true
});