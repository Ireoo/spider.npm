var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');

var Spider = function(opts) {
    this.rules = opts.rules || config;
    this.callback = opts.callback;
    // if (opts.run) this.run();
    return this;
};

Spider.prototype.rule = function(rules) {
    var r = rules || this.rules;
    r.forEach(function(v) {
        this.get(v.url, function($) {
            this.one(v.rules, $);
        });
    });
};

Spider.prototype.one = function(rules, $) {
    rules.forEach(function(rule) {
        var list = [];
        $(rule.list).each(function(i, v) {
            var one = {};
            for (var k in rule.rule) {
                // var a = rule.rule[k].split(' ');
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
            };
            list.push(one);
        });
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
