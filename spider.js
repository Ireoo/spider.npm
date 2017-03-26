var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');

var Spider = function(opts) {
    this.rules = opts.rules || config;
    this.callback = opts.callback;
    if (opts.run) this.run();
    return Spider;
};

Spider.prototype.run = function(rules) {
    console.trace();
    console.time("[+] 规则运行时间.");
    this.once(rules || this.rules, function(once) {
        this.get(once.url, function(jQuery) {
            this.once(once.rules, function(one) {
                if (one.list) {
                    if (one.rule.url) {
                        console.info("[+] [" + once.url + "]运行规则中...");
                        console.dir(one);
                        this.list(one, jQuery, function(rule) {
                            console.info("[+] [" + once.url + "]运行规则完成.");
                            this.run(rule);
                        });
                    } else {
                        console.error("[-] [" + once.url + "]列表中不含网址规则,无法继续操作!");
                    }
                } else {
                    console.info("[+] [" + once.url + "]正在获取数据...");
                    this.one(one, jQuery, function(data) {
                        console.dir(data);
                        console.info("[+] [" + once.url + "]获取数据完成.");
                        console.timeEnd("[+] 规则运行时间.");
                        this.callback(data);
                    });
                }
            });
        });
    });
    return Spider;
};

Spider.prototype.list = function(spider, $, cb) {
    console.trace();
    $(spider.list).each(function(i, v) {
        var one = {};
        for (var k in spider.rule) {
            switch (spider.rule[k].type) {
                case 'text':
                    one[k] = v.find(spider.rule[k].text).text();
                    break;

                case 'html':
                    one[k] = v.find(spider.rule[k].text).html();
                    break;

                case 'val':
                    one[k] = v.find(spider.rule[k].text).val();
                    break;

                default:
                    one[k] = v.find(spider.rule[k].text).attr(spider.rule[k].type);
                    break;
            }
        }
        this.once(spider.link, function(once) {
            once.url = one.url;
            cb(once);
        });
    });
};

Spider.prototype.one = function(spider, $, cb) {
    console.trace();
    var one = {};
    for (var k in spider.rule) {
        switch (spider.rule[k].type) {
            case 'text':
                one[k] = $(spider.rule[k].text).text();
                break;

            case 'html':
                one[k] = $(spider.rule[k].text).html();
                break;

            case 'val':
                one[k] = $(spider.rule[k].text).val();
                break;

            default:
                one[k] = $(spider.rule[k].text).attr(spider.rule[k].type);
                break;
        }
    }
    cb(one);
};

Spider.prototype.get = function(url, cb) {
    console.trace();
    needle.get(url, function(err, res) {
        if (!err) {
            try {
                cb(cheerio.load(res.body));
            } catch (e) {
                console.error("[-] [" + url + "]页面处理失败: ", e);
            }
        } else {
            console.log("[-] [" + url + "]网页访问错误: ", err);
        }
    });
};

Spider.prototype.more = function(list, cb) {

};

Spider.prototype.once = function(more, cb) {
    console.trace();
    if (this.isArray(more)) {
        more.forEach(function(once) {
            cb(once);
        });
    } else {
        cb(more);
    }
};

Spider.prototype.isArray = function(object) {
    console.trace();
    return object && typeof object === 'object' && Array == object.constructor;
};


exports = module.exports = Spider;
