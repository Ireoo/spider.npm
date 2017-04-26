"use strict";

var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./test/config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var async = require('async');
var Queue = require('promise-queue-plus');

console.log(config);

class Spider {
    constructor(options) {
        if(options) {
            this.init = _.merge({
                debug: false,
                delay: 3000,
                timeout: 3000,
                threads: 10
            }, options.init);
            if (options.callback) this.cb = options.callback;
            //实列化一个最大并发为1的队列
            this.queue = new Queue(this.init.threads,{
                "queueStart": function(queue){}
                ,"queueEnd": function(queue){}
                ,"workAdd": function(item, queue){}
                ,"workResolve": function(value, queue){}
                ,"workReject": function(reason, queue){}
                ,"workFinally": function(queue){}
                ,"retry": 1               //Number of retries
                ,"retryIsJump": true      //retry now?
                ,"timeout": this.init.timeout           //The timeout period
            });
            this.headers = options.headers || {
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
                };
            if (options.run) this.run(options.links || config);
        } else {
            console.log('没有设置基础参数!');
        }
        return this;
    }

    run(links, input) {
        var t = this;
        // var data = {};
        // if(input) data = input;
        t.once(links, function(once) {
            // console.log(once);
            t.html(once.url, function($) {
                // console.log(once.link);
                var d = t.rule(once.url, once.rules, $, input);
                if(d !== undefined) t.cb(d);
            });
            // await t.sleep();
        });
    }

    rule(url, rules, $, d) {
        var t = this;
        var list = {}, data = {};
        if(_.isArray(rules)) {
            for (var i in rules) {
                var rule = rules[i];
                if (rule.list) {
                    if (rule.key) {
                        list[rule.key] = t.list(rule, $);
                        if (d) {
                            d = _.merge(d, list);
                        } else {
                            d = list;
                        }
                    } else {
                        list = t.list(rule, $);
                        list.forEach(function (li) {
                            if (li.url) {
                                li.url = t.url(url, li.url);
                                if (rule.links) {
                                    t.once(rule.links, function (r) {
                                        r.url = li.url;
                                        // console.log(rule, li);
                                        if (!r.key) {
                                            t.run(r, li);
                                        }
                                    });
                                }
                            }
                        });
                    }
                } else {
                    data = t.data(rule, $);
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
                    list[rule.key] = t.list(rule, $);
                    if (d) {
                        d = _.merge(d, list);
                    } else {
                        d = list;
                    }
                } else {
                    list = t.list(rule, $);
                    list.forEach(function (li) {
                        if (li.url) {
                            li.url = t.url(url, li.url);
                            if (rule.links) {
                                t.once(rule.links, function (r) {
                                    r.url = li.url;
                                    if (!r.key) {
                                        t.run(r, li);
                                    }
                                });
                            }
                        }
                    });
                }
            } else {
                data = t.data(rule, $);
                if (d) {
                    d = _.merge(d, data);
                } else {
                    d = data;
                }
            }
        }
        return d;
    }

    link(link, data) {
        var t = this;
        t.html(link.url, function($) {
            t.once(link.rules, function(rule) {
                if(rule.list) {
                    var list = t.list(rule, $);
                    list.forEach(function(li) {
                        if(li.url) {
                            li.url = t.url(link.url, li.url);
                            if(rule.link) {
                                t.run(rule.link, li);
                            }
                        }
                    });
                    if(!rule.link) {
                        t.cb(list);
                    }
                } else {
                    var d = _.merge(data, t.data(rule, $));
                    t.cb(d);
                }
            });
        });
    }

    list(rules, $) {
        var t = this;
        var list = [];
        $(rules.list).each(function() {
            var one = {};
            for( var k in rules.rule) {
                if(rules.rule[k].text && rules.rule[k].text != '') {
                    switch (rules.rule[k].type) {
                        case 'text':
                            one[k] = $(this).find(rules.rule[k].text).text();
                            break;

                        case 'html':
                            one[k] = $(this).find(rules.rule[k].text).html();
                            break;

                        case 'val':
                            one[k] = $(this).find(rules.rule[k].text).val();
                            break;

                        default:
                            one[k] = $(this).find(rules.rule[k].text).attr(rules.rule[k].type);
                            break;
                    }
                } else {
                    switch (rules.rule[k].type) {
                        case 'text':
                            one[k] = $(this).text();
                            break;

                        case 'html':
                            one[k] = $(this).html();
                            break;

                        case 'val':
                            one[k] = $(this).val();
                            break;

                        default:
                            one[k] = $(this).attr(rules.rule[k].type);
                            break;
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
                    one[k] = $(rules.rule[k].text).text();
                    break;

                case 'html':
                    one[k] = $(rules.rule[k].text).html();
                    break;

                case 'val':
                    one[k] = $(rules.rule[k].text).val();
                    break;

                default:
                    one[k] = $(rules.rule[k].text).attr(rules.rule[k].type);
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
        var t = this;
        if (t.init.debug) console.time("[+] [" + url + "]网页获取时间");
        this.queue.go(t.thread_get_html,[url]).then(function(data) {
            if (t.init.debug) console.timeEnd("[+] [" + url + "]网页获取时间");
            if (t.init.debug == 'html') console.info(data.html());
            cb(data);
        }, function(err) {
            console.error("[-] [" + url + "]获取失败,重试中!!!");
            t.html(url, cb);
        });
    }

    thread_get_html(url) {
        var t = this;
        return new Promise(function (resolve, reject) {
            needle.get(url, t.headers || {
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
                }, function(err, res) {
                if(!err) resolve(cheerio.load(res.body));
            });
        });
    }

    sleep() {
        var t = this;
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, t.init.delay);
        });
    }

    url(url, t) {
        return /^https?:/.test(t) ? t : urlResolve(url, t);
    }
}

exports = module.exports = Spider;