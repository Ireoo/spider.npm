"use strict";

var needle = require('needle');
var cheerio = require('cheerio');

function a(url, cb) {
    needle.get(url, function(err, res) {
        // console.log(url, source);
        if (!err) {
            try {
                cb(cheerio.load(res.body));
            } catch (e) {
                console.error("[-] [" + url + "]页面处理失败: ", e);
            }
        }
    });
}

a('http://www.poxiao.com/', console.log);