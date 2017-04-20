"use strict";

var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var async = require('async');

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
        }
        return this;
    }

    async html(url, cb) {
        // var html;
        await this.thread_get_html(url).then(cb);
    }

    thread_get_html(url) {
        return new Promise(function (resolve, reject) {
            needle.get(url, function(err, res) {
                resolve(res);
            });
        });
    }
}

var spider = new net();
var html = spider.html("https://www.baidu.com", function(data) {
    console.log(data);
});

// console.log(html);