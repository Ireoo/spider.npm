/**
 * Created by S2 on 2017/3/17.
 */

var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');

var spider = function(opts) {
    this.rules = opts.rules || config;
    this.cb = opts.cb;
    if (opts.run) this.run();
    return this;
};

spider.prototype.run = function(rules) {
    var r = rules || this.rules;
    r.forEach(function(v) {
        this.web(v.url, function($) {
            this.one(v.rules, $);
        });
    });
};

spider.prototype.one = function(rules, $) {
    rules.forEach(function(rule) {
        var list = [];
        $(rule.list).each(function(i, v) {
            var one = {};
            for (var k in rule.rule) {
                one[k] = v.find(rule.rule[k]).text();
            };
            list.push(one);
        });
    });
};

spider.prototype.web = function(url, cb) {
    needle.get(url, function(err, res) {
        if (!err) {
            cb(cheerio.load(res.body));
        } else {
            console.log(err);
        }
    });
};

exports = module.exports = spider;
