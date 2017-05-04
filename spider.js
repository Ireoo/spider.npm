"use strict";

var config = require('./test/config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var crawler = require('./lib/crawler');
// var crawler = require('node-web-crawler');

class Spider {
    constructor(options) {
        var self = this;
        if (options) {
            self.init = _.merge({
                debug: false,
                delay: 0,
                timeout: 3000,
                threads: 10,
                retries: 10,
                cache: false,
                skipDuplicates: true,
                jQuery: true,
                utf8: false,
                loop: false,
                userAgent: 'Mozilla/5.0 (compatible; spider.io/4.0+; +https://www.npmjs.com/package/spider.io)'
            }, options.init);
            self.links = options.links;
            if (options.callback) self.cb = options.callback;
            if (options.done) self.done = options.done;
            self.c = new crawler({
                userAgent: self.init.userAgent,
                debug: self.init.debug,
                maxConnections: self.init.threads,
                timeout: self.init.timeout,
                rateLimits: self.init.delay,
                onDrain: function() {
                    if (self.init.loop) {
                        new Spider({init: self.init, links: self.links, callback: self.cb, done: self.done, run: true});
                    }
                    if (self.done) self.done();
                },
                forceUTF8: self.init.utf8,
                retries: self.init.retries,
                cache: self.init.cache,
                skipDuplicates: self.init.skipDuplicates,
                jQuery: self.init.jQuery
            });
            if (options.run) self.run(self.links || config);
        } else {
            console.log('没有设置基础参数!');
        }
        return self;
    }

    run(links, input) {
        var self = this;
        if(links) self.links = links;
        self.once(self.links, function(one) {
            self.urls(one, function(once) {
                if (once.max) {
                    for (var g = once.min || 1; g <= once.max; g++) {
                        var url = once.url.replace(/{i}/, g);
                        self.html(url, function($) {
                            var d = self.rule(once.hash || false, url, once.rules, $, input);
                            if (d !== undefined) self.cb(once.hash || false, d);
                        });
                    }
                } else {
                    self.html(once.url, function($) {
                        var d = self.rule(once.hash || false, once.url, once.rules, $, input);
                        if (d !== undefined) self.cb(once.hash || false, d);
                    });
                }
            });
        });
        return self;
    }

    urls(once, cb) {
        if (_.isString(once.url)) {
            cb(once);
        } else {
            once.url.forEach(function(v, i) {
                var r = once;
                r.url = v;
                cb(r);
            });
        }
    }

    rule(hash, url, rules, $, d) {
        var self = this;
        var list = {},
            data = {};
        if (_.isArray(rules)) {
            for (var i in rules) {
                var rule = rules[i];
                if (rule.list) {
                    if (rule.key) {
                        list[rule.key] = self.list(rule, $);
                        if (d) {
                            d = _.merge(d, list);
                        } else {
                            d = list;
                        }
                    } else {
                        list = self.list(rule, $);
                        list.forEach(function(li) {
                            if (li.url) {
                                li.url = self.url(url, li.url);
                                if (rule.links) {
                                    self.once(rule.links, function(r) {
                                        r.hash = hash;
                                        r.url = li.url;
                                        if (!r.key) {
                                            self.run(r, li);
                                        }
                                    });
                                }
                            }
                        });
                        if (!rule.links) {
                            if (d) {
                                d = _.merge(d, list);
                            } else {
                                d = list;
                            }
                        }
                    }
                } else {
                    data = self.data(rule, $);
                    if (d) {
                        d = _.merge(d, data);
                    } else {
                        d = data;
                    }
                }
            }
        } else {
            var rule = rules;
            if (rule.list) {
                if (rule.key) {
                    list[rule.key] = self.list(rule, $);
                    if (d) {
                        d = _.merge(d, list);
                    } else {
                        d = list;
                    }
                } else {
                    list = self.list(rule, $);
                    list.forEach(function(li) {
                        if (li.url) {
                            li.url = self.url(url, li.url);
                            if (rule.links) {
                                self.once(rule.links, function(r) {
                                    r.hash = hash;
                                    r.url = li.url;
                                    if (!r.key) {
                                        self.run(r, li);
                                    }
                                });
                            }
                        }
                    });
                    if (!rule.links) {
                        if (d) {
                            d = _.merge(d, list);
                        } else {
                            d = list;
                        }
                    }
                }
            } else {
                data = self.data(rule, $);
                if (d) {
                    d = _.merge(d, data);
                } else {
                    d = data;
                }
            }
        }
        return d;
    }

    list(rules, $) {
        if (rules.cb) return rules.cb($);
        var list = [];
        $(rules.list).each(function() {
            if (_.isString(rules.rule)) {
                var one = $(this).attr(rules.rule);
            } else {
                var one = {};
                for (var k in rules.rule) {
                    if (rules.rule[k].text && rules.rule[k].text != '') {
                        switch (rules.rule[k].type) {
                            case 'text':
                                if ($(this).find(rules.rule[k].text).text()) one[k] = $(this).find(rules.rule[k].text).text();
                                break;

                            case 'html':
                                if ($(this).find(rules.rule[k].text).html()) one[k] = $(this).find(rules.rule[k].text).html();
                                break;

                            case 'val':
                                if ($(this).find(rules.rule[k].text).val()) one[k] = $(this).find(rules.rule[k].text).val();
                                break;

                            default:
                                if ($(this).find(rules.rule[k].text).attr(rules.rule[k].type)) one[k] = $(this).find(rules.rule[k].text).attr(rules.rule[k].type);
                                break;
                        }
                    } else {
                        switch (rules.rule[k].type) {
                            case 'text':
                                if ($(this).text()) one[k] = $(this).text();
                                break;

                            case 'html':
                                if ($(this).html()) one[k] = $(this).html();
                                break;

                            case 'val':
                                if ($(this).val()) one[k] = $(this).val();
                                break;

                            default:
                                if ($(this).attr(rules.rule[k].type)) one[k] = $(this).attr(rules.rule[k].type);
                                break;
                        }
                    }
                }
            }
            list.push(one);
        });
        return list;
    }

    data(rules, $) {
        if (rules.cb) return rules.cb($);
        var one = {};
        for (var k in rules.rule) {
            switch (rules.rule[k].type) {
                case 'text':
                    if ($(rules.rule[k].text).text()) one[k] = $(rules.rule[k].text).text();
                    break;

                case 'html':
                    if ($(rules.rule[k].text).html()) one[k] = $(rules.rule[k].text).html();
                    break;

                case 'val':
                    if ($(rules.rule[k].text).val()) one[k] = $(rules.rule[k].text).val();
                    break;

                default:
                    if ($(rules.rule[k].text).attr(rules.rule[k].type)) one[k] = $(rules.rule[k].text).attr(rules.rule[k].type);
                    break;
            }
        }
        return one;
    }

    once(more, cb) {
        if (_.isArray(more)) {
            more.forEach(function(once) {
                cb(once);
            });
        } else {
            cb(more);
        }
    }

    html(url, cb) {
        var self = this;
        self.c.queue([{
            uri: url,
            callback: function (error, result, $) {
                if (!error && $) {
                    cb($);
                } else {
                    self.html(url, cb);
                }
            }
        }]);
    }

    url(url, t) {
        return /^https?:/.test(t) ? t : urlResolve(url, t);
    }
}

exports = module.exports = Spider;
