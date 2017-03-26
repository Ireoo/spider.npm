var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');

var Spider = function(opts) {
    this.rules = opts.rules || config;
    this.callback = opts.callback;
    // if (opts.run) this.run();
    return this;
};

Spider.prototype.rule = function(rules, cb) {
    var r = rules || this.rules;
    r.forEach(function(v) {
        this.get(v.url, function($) {
            this.one(v, $, cb);
        });
    });
};

Spider.prototype.one = function(o, $, cb) {
    o.rules.forEach(function(rule) {
        if(rule.list) {
            $(rule.list).each(function (i, v) {
                var one = {};
                var r = o.link;
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
                this.run(r, function(data) {
                    for(var k in data) {
                        one[k] = data[k];
                    }
                    cb(one);
                });
            });
        } else {
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
            this.callback(one);
        }
    });
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

exports = module.exports = Spider;
