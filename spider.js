"use strict";

var config = require('./test/config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var crawler = require('./lib/node-web-crawler');

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
                userAgent: 'spider.io with Node.js(https://www.npmjs.com/package/spider.io)'
            }, options.init);
            if (options.callback) self.cb = options.callback;
            self.c = new crawler({
                userAgent: self.init.userAgent,
                debug: self.init.debug,
                maxConnections: self.init.threads,
                timeout: self.init.timeout,
                rateLimits: self.init.delay,
                onDrain: options.done,
                forceUTF8: self.init.utf8,
                retries: self.init.retries,
                cache: self.init.cache,
                skipDuplicates: self.init.skipDuplicates,
                jQuery: self.init.jQuery
            });
            if (options.run) self.run(options.links || config);
        } else {
            console.log('没有设置基础参数!');
        }
        return self;
    }

    run(links, input) {
        var self = this;
        self.once(links, function(once) {
            self.html(once.url, function($) {
                var d = self.rule(once.hash || false, once.url, once.rules, $, input);
                if (d !== undefined) self.cb(once.hash || false, d);
            });
        });
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
        var self = this;
        var list = [];
        $(rules.list).each(function() {
            // if (rules.cb) {
            //     var one = rules.cb($(this));
            // } else {
            if (_.isString(rules.rule)) {
                var one = $(this).attr(rules.rule);
            } else {
                var one = {};
                for (var k in rules.rule) {
                    one[k] = self.dataRule(rules.rule[k], $);
                }
            }
            // }
            list.push(one);
        });
        return list;
    }

    data(rules, $) {
        var self = this;
        // if (rules.cb) {
        //     return rules.cb($);
        // } else {
        var one = {};
        for (var k in rules.rule) {
            one[k] = self.dataRule(rules.rule[k], $);
        }
        return one;
        // }
    }

    dataRule(rule, $) {
        if (rule.text && rule.text != '') {
            switch (rule.type) {
                case 'text':
                    if ($(rule.text).text()) return $(rule.text).text();
                    break;

                case 'html':
                    if ($(rule.text).html()) return $(rule.text).html();
                    break;

                case 'val':
                    if ($(rule.text).val()) return $(rule.text).val();
                    break;

                default:
                    if ($(rule.text).attr(rule.type)) return $(rule.text).attr(rule.type);
                    break;
            }
        } else {
            switch (rule.type) {
                case 'text':
                    if ($(this).text()) return $(this).text();
                    break;

                case 'html':
                    if ($(this).html()) return $(this).html();
                    break;

                case 'val':
                    if ($(this).val()) return $(this).val();
                    break;

                default:
                    if ($(this).attr(rule.type)) return $(this).attr(rule.type);
                    break;
            }
        }
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
            callback: function(error, result, $) {
                if (!error && $) {
                    cb($);
                } else {
                    html(url, cb);
                }
            }
        }]);
    }

    url(url, t) {
        return /^https?:/.test(t) ? t : urlResolve(url, t);
    }
}

exports = module.exports = Spider;
