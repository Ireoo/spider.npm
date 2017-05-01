"use strict";

var config = require('./test/config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var crawler = require('./lib/node-web-crawler');

class Spider {
    constructor(options) {
        var self = this;
        if(options) {
            self.init = _.merge({
                debug: false,
                delay: 0,
                timeout: 3000,
                threads: 10,
                retries: 10,
                cache: false,
                skipDuplicates: true,
                jQuery: true,
                userAgent: 'spider.io with Node.js(https://www.npmjs.com/package/spider.io)'
            }, options.init);
            if (options.callback) self.cb = options.callback;
            self.c = new crawler({
                userAgent: self.init.userAgent,
                debug: self.init.debug,
                maxConnections : self.init.threads,
                timeout: self.init.timeout,
                rateLimits: self.init.delay,
                onDrain: options.done,
                forceUTF8: true,
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
                var d = self.rule(once.hash, once.url, once.rules, $, input);
                if(d !== undefined) self.cb(once.hash, d);
            });
        });
    }

    rule(hash, url, rules, $, d) {
        var self = this;
        var list = {}, data = {};
        if(_.isArray(rules)) {
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
                        list.forEach(function (li) {
                            if (li.url) {
                                li.url = self.url(url, li.url);
                                if (rule.links) {
                                    self.once(rule.links, function (r) {
                                        r.hash = hash;
                                        r.url = li.url;
                                        if (!r.key) {
                                            self.run(r, li);
                                        }
                                    });
                                }
                            }
                        });
                        if(!rule.links) {
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
                    list.forEach(function (li) {
                        if (li.url) {
                            li.url = self.url(url, li.url);
                            if (rule.links) {
                                self.once(rule.links, function (r) {
                                    r.hash = hash;
                                    r.url = li.url;
                                    if (!r.key) {
                                        self.run(r, li);
                                    }
                                });
                            }
                        }
                    });
                    if(!rule.links) {
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
        var list = [];
        $(rules.list).each(function() {
            if(_.isString(rules.rule)) {
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
        var one = {};
        for(var k in rules.rule) {
            switch (rules.rule[k].type) {
                case 'text':
                    if($(rules.rule[k].text).text()) one[k] = $(rules.rule[k].text).text();
                    break;

                case 'html':
                    if($(rules.rule[k].text).html()) one[k] = $(rules.rule[k].text).html();
                    break;

                case 'val':
                    if($(rules.rule[k].text).val()) one[k] = $(rules.rule[k].text).val();
                    break;

                default:
                    if($(rules.rule[k].text).attr(rules.rule[k].type)) one[k] = $(rules.rule[k].text).attr(rules.rule[k].type);
                    break;
            }
        }
        return one;
    }

    once(more, cb) {
        if(_.isArray(more)) {
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
                if(!error && $) {
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