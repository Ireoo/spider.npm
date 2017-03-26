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
    var r = rules || this.rules;
    if (this.isArray(r)) {
        r.forEach(function(v) {
            this.get(v.url, function(jQuery) {
                if (this.isArray(v.rules)) {
                    v.rules.forEach(function(rule) {
                        if (rule.list) {
                            if (rule.rule.url) {
                                this.list(v, jQuery, function(list) {
                                    this.run(list);
                                });
                            } else {
                                console.log("列表中不含网址规则,无法继续操作!");
                            }
                        } else {
                            this.one(v, jQuery, function(data) {
                                this.callback(data);
                            });
                        }
                    });
                } else {
                    if (v.rules.list) {
                        if (v.rules.rule.url) {
                            this.list(v.rules, jQuery, function(list) {
                                this.run(list);
                            });
                        } else {
                            console.log("列表中不含网址规则,无法继续操作!");
                        }
                    } else {
                        this.one(v.rules, jQuery, function(data) {
                            this.callback(data);
                        });
                    }
                }
            });
        });
    } else {
        this.get(r.url, function(jQuery) {
            if (r.rules.constructor == Array) {
                r.rules.forEach(function(rule) {
                    if (rule.list) {
                        if (rule.rule.url) {
                            this.list(rule, jQuery, function(list) {
                                this.run(list);
                            });
                        } else {
                            console.log("列表中不含网址规则,无法继续操作!");
                        }
                    } else {
                        this.one(rule, jQuery, function(data) {
                            this.callback(data);
                        });
                    }
                });
            } else {
                if (rules.list) {
                    if (rules.rule.url) {
                        this.list(rules, jQuery, function(list) {
                            this.run(list);
                        });
                    } else {
                        console.log("列表中不含网址规则,无法继续操作!");
                    }
                } else {
                    this.one(rules, jQuery, function(data) {
                        this.callback(data);
                    });
                }
            }
        });
    }
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

Spider.prototype.isArray = function(object) {
    return object && typeof object === 'object' && Array == object.constructor;
};


exports = module.exports = Spider;
