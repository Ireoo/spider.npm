"use strict";

var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var async = require('async');
var queuefun = require('queue-fun');
var Queue = queuefun.Queue(); //初始化Promise异步队列类
var q = queuefun.Q;  //配合使用的Promise流程控制类，也可以使用原生Promise也可以用q.js代替

class net {
    constructor(options) {
        if(options) {
            this.init = _.merge({
                debug: true,
                threads: 1
            }, options.init);
            if (options.callback) this.cb = options.callback;
        } else {
            this.init = {
                debug: true,
                threads: 1
            };
            this.cb = function() {}
        }
        //实列化一个最大并发为1的队列
        this.queue = new Queue(1);
        return this;
    }

    async run(links) {
        this.more(links, function(once) {
            var this_rules = once.rules;
            var this_url = once.url;
            var this_data = once.data;
            this.html(this_url, function($) {

            });
        });
    }

    async html(url, cb) {
        // var html;
        await this.thread_get_html(url).then(cb);
    }

    thread_get_html(url) {
        return new Promise(function (resolve, reject) {
            needle.get(url, function(err, res) {
                resolve(cheerio.load(res.body));
            });
        });
    }
}

var spider = new net();
var html = spider.html("https://www.baidu.com", function(data) {
    console.log(data.html());
});

console.log(html);