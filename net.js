"use strict";

var needle = require('needle');
var cheerio = require('cheerio');
var config = require('./config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var async = require('async');
var Queue = require('promise-queue-plus');

class net {
    constructor(options) {
        if(options) {
            this.init = _.merge({
                debug: true,
                delay: 3000,
                timeout: 3000,
                threads: 1
            }, options.init);
            if (options.callback) this.cb = options.callback;
        } else {
            this.init = {
                debug: true,
                delay: 3000,
                timeout: 3000,
                threads: 1
            };
            this.cb = function() {}
        }
        //实列化一个最大并发为1的队列
        this.queue = new Queue(this.init.threads,{
            "queueStart": function(queue){}
            ,"queueEnd": function(queue){}
            ,"workAdd": function(item, queue){}
            ,"workResolve": function(value, queue){}
            ,"workReject": function(reason, queue){}
            ,"workFinally": function(queue){}
            ,"retry": 1               //Number of retries
            ,"retryIsJump": true     //retry now?
            ,"timeout": 1000           //The timeout period
        });
        needle.defaults({
            open_timeout: this.init.timeout,
            read_timeout: this.init.timeout,
            timeout: this.init.timeout,
            user_agent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; SV1; .NET CLR 1.1.4322)'
        });
        if (options.run) this.run(options.rules);
        return this;
    }

    run(links, input) {
        var t = this;
        var data = {};
        if(input) data = input;
        t.once(links, function(once) {
            // console.log(once);
            t.html(once.url, function($) {
                // console.log(once.link);
                t.once(once.rules, function(rule) {
                    if(rule.list) {
                        var list = t.list(rule, $);
                        list.forEach(function(li) {
                            if(li.url) {
                                li.url = t.url(once.url, li.url);
                                if(rule.link) {
                                    t.once(rule.link, function(rule) {
                                        rule.url = li.url;
                                        // console.log(rule, li);
                                        if(!rule.key) {
                                            t.run(rule, li);
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        var d = _.merge(data, t.data(rule, $));
                        t.cb(d);
                        // console.log(JSON.stringify(data));
                    }
                });
            });
            // await t.sleep();
        });
    }

    rule(rules, li) {
        var t = this;
        t.once(rules, function(rule) {
            // list.forEach(function(li) {
                rule.url = li.url;
                t.run(rule, li);
            // });
        });
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
                    // console.log(JSON.stringify(data));
                }
            });
        });
    }

    list(rules, $) {
        var t = this;
        var list = [];
        $(rules.list).each(function() {
            var one = {};
            // rules.rule.forEach(function(v, k) {
            for( var k in rules.rule) {
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
            }
            list.push(one);
        });
        return list;
    }

    data(rules, $) {
        // console.log(rules);
        var one = {};
        // rules.rule.forEach(function(v, k) {
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
        // var l = {};
        // l[rules.rule.key] = one;
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
            cb(data);
        }, function(err) {
            console.error("[-] [" + url + "]获取失败,重试中!!!");
            t.html(url, cb);
        });
        // await this.thread_get_html(url).then(cb);
    }

    thread_get_html(url) {
        return new Promise(function (resolve, reject) {
            needle.get(url, function(err, res) {
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

exports = module.exports = net;

// var spider = new net();
// var html = spider.run({url: "https://www.baidu.com"});

// console.log(html.$);