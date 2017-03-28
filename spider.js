var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');
var spawn = require("child_process").spawn;
var _ = require('lodash');
var urlResolve = require('url').resolve;

var Spider = function(opts) {
    Spider.prototype.rules = opts.rules || config;
    Spider.prototype.callback = opts.callback;
    if (opts.run) Spider.prototype.run();
    return Spider;
};

Spider.prototype.run = function(rules) {
    Spider.prototype.once(rules || this.rules, function(once) {
        Spider.prototype.get(once.url, function(jQuery) {
            Spider.prototype.once(once.rules, function(one) {
                if (one.list) {
                    if (one.rule.url) {
                        console.info("[+] [" + once.url + "]运行规则中...");
                        // console.dir(one);
                        Spider.prototype.list({spider: one, $: jQuery, url: once.url}, function(rule) {
                            console.info("[+] [" + once.url + "]运行规则完成.");
                            Spider.prototype.run(rule);
                        });
                    } else {
                        console.error("[-] [" + once.url + "]列表中不含网址规则,无法继续操作!");
                    }
                } else {
                    console.info("[+] [" + once.url + "]正在获取数据...");
                    Spider.prototype.one({spider: one, $: jQuery}, function(data) {
                        // console.dir(data);
                        console.info("[+] [" + once.url + "]获取数据完成.");
                        Spider.prototype.callback(data);
                    });
                }
            });
        });
    });
    return Spider;
};

Spider.prototype.list = function(options, cb) {
    // console.trace();
    options.$(options.spider.list).each(function() {
        var one = {};
        for (var k in options.spider.rule) {
            switch (options.spider.rule[k].type) {
                case 'text':
                    one[k] = options.$(this).find(options.spider.rule[k].text).text();
                    break;

                case 'html':
                    one[k] = options.$(this).find(options.spider.rule[k].text).html();
                    break;

                case 'val':
                    one[k] = options.$(this).find(options.spider.rule[k].text).val();
                    break;

                default:
                    one[k] = options.$(this).find(options.spider.rule[k].text).attr(options.spider.rule[k].type);
                    break;
            }
        }
        // console.log(one);
        if(options.spider.link) {
            Spider.prototype.once(options.spider.link, function (once) {
                console.log(one.url);
                once.url = url(options.url, one.url);
                cb(once);
            });
        } else {
            cb(false);
        }
    });
};

Spider.prototype.one = function(options, cb) {
    // console.trace();
    var one = {};
    for (var k in options.spider.rule) {
        switch (options.spider.rule[k].type) {
            case 'text':
                one[k] = options.$(options.spider.rule[k].text).text();
                break;

            case 'html':
                one[k] = options.$(options.spider.rule[k].text).html();
                break;

            case 'val':
                one[k] = options.$(options.spider.rule[k].text).val();
                break;

            default:
                one[k] = options.$(options.spider.rule[k].text).attr(options.spider.rule[k].type);
                break;
        }
    }
    cb(one);
};

Spider.prototype.get = function(url, cb) {
    console.time("[+] [" + url + "]网页获取时间");
    needle.get(url, function(err, res) {
        if (!err) {
            try {
                console.info("[+] [" + url + "]页面处理完成.");
                cb(cheerio.load(res.body));
            } catch (e) {
                console.error("[-] [" + url + "]页面处理失败: ", e);
            }
        } else {
            console.error("[-] [" + url + "]网页访问错误: ", err);
        }
        console.timeEnd("[+] [" + url + "]网页获取时间");
    });
};

Spider.prototype.once = function(more, cb) {
    if (_.isArray(more)) {
        more.forEach(function(once) {
            // console.info(once);
            cb(once);
        });
    } else {
        // console.info(more);
        cb(more);
    }
};


exports = module.exports = Spider;

function url(url, t) {
    return /^https?:/.test(t) ? this : urlResolve(url, t);
};