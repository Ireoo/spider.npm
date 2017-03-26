var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');

var Spider = function(opts) {
    this.rules = opts.rules || config;
    this.callback = opts.callback;
    // if (opts.run) this.run();
    return this;
};

Spider.prototype.run = function(rules) {
    this.once(rules || this.rules, function(once) {
        this.get(once.url, function(jQuery) {
            this.once(once.rules, function(one) {
                if (one.list) {
                    if (one.rule.url) {
                        this.list(one, jQuery, function(rule) {
                            this.run(rule);
                        });
                    } else {
                        console.log("列表中不含网址规则,无法继续操作!");
                    }
                } else {
                    this.one(one, jQuery, function(data) {
                        this.callback(data);
                    });
                }
            });
        });
    });
};

Spider.prototype.list = function(rule, $, cb) {
    $(rule.list).each(function(i, v) {
        var one = {};
        for (var k in rule.rule) {
            switch (rule.rule[k].type) {
                case 'text':
                    one[k] = v.find(rule.rule[k].text).text();
                    break;

                case 'html':
                    one[k] = v.find(rule.rule[k].text).html();
                    break;

                case 'val':
                    one[k] = v.find(rule.rule[k].text).val();
                    break;

                default:
                    one[k] = v.find(rule.rule[k].text).attr(rule.rule[k].type);
                    break;
            }
        }
        rule.link.url = one.url;
        cb(rule);
    });
};

Spider.prototype.one = function(rule, $, cb) {
    var one = {};
    for (var k in rule.rule) {
        switch (rule.rule[k].type) {
            case 'text':
                one[k] = $(rule.rule[k].text).text();
                break;

            case 'html':
                one[k] = $(rule.rule[k].text).html();
                break;

            case 'val':
                one[k] = $(rule.rule[k].text).val();
                break;

            default:
                one[k] = $(rule.rule[k].text).attr(rule.rule[k].type);
                break;
        }
    }
    cb(one);
};

Spider.prototype.get = function(url, cb) {
    needle.get(url, function(err, res) {
        if (!err) {
            cb(cheerio.load(res.body));
        } else {
            console.log(err);
        }
    });
};

Spider.prototype.more = function(list, cb) {

};

Spider.prototype.once = function(more, cb) {
    if (this.isArray(more)) {
        more.forEach(function(once) {
            cb(once);
        });
    } else {
        cb(more);
    }
};

Spider.prototype.isArray = function(object) {
    return object && typeof object === 'object' && Array == object.constructor;
};


exports = module.exports = Spider;
