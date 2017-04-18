/**
 * Created by i on 17-4-18.
 */

"use strict";

var needle = require('needle');
var cheerio = require('cheerio');
var _ = require('lodash');
var urlResolve = require('url').resolve;

class Spider {
    constructor (options) {
        Spider.prototype.init = _.merge({
            debug: false,
            delay: 0,
            threads: 1
        }, options.init);
        Spider.prototype.callback = options.callback;
        if(options.run) this.run(options.links);
        return this;
    }

    html(rule, cb) {
        if (Spider.prototype.init.debug) console.time("[+] [" + rule.url + "]网页获取时间");
        needle.get(rule.url, function(err, res) {
            // console.log(url, source);
            if (!err) {
                try {
                    if (Spider.prototype.init.debug) console.info("[+] [" + rule.url + "]页面处理完成.");
                    cb(rule.url, cheerio.load(res.body), rule.rules);
                } catch (e) {
                    if (Spider.prototype.init.debug) console.error("[-] [" + rule.url + "]页面处理失败: ", e);
                }
            } else {
                if (Spider.prototype.init.debug) console.error("[-] [" + rule.url + "]网页访问错误: ", err);
            }
            if (Spider.prototype.init.debug) console.timeEnd("[+] [" + rule.url + "]网页获取时间");
        });
    }

    run(links) {
        this.link(links, function(once) {
            Spider.prototype.html(once, function(url, $, rules) {
                Spider.prototype.rule(url, $, rules, function(url, $, one) {
                    // console.log(url, $, one);
                    if (one.list) {
                        if (Spider.prototype.init.debug) console.info("[+] [" + url + "]运行规则中...");
                        // console.dir(one);
                        Spider.prototype.list(url, one, $, function(o, data) {
                            // console.log(o);
                            // sleep(this.init.delay);
                            if (!one.link) {
                                Spider.prototype.callback(data);
                            }
                        });
                    } else {
                        if (Spider.prototype.init.debug) console.info("[+] [" + url + "]正在获取数据...");
                        Spider.prototype.one(url, one, $, function(data) {
                            if (Spider.prototype.init.debug) console.info("[+] [" + data.url + "]获取数据完成.");
                            Spider.prototype.callback(data);
                        });
                    }
                });
            });
        });
    }

    link(more, cb) {
        if(_.isArray(more)) {
            more.forEach(function(once) {
                cb(once);
            });
        } else {
            cb(more);
        }
    }

    rule(url, $, more, cb) {
        if(_.isArray(more)) {
            more.forEach(function(once) {
                cb(url, $, once);
            });
        } else {
            cb(url, $, more);
        }
    }

    list(url, one, $, cb) {
        // console.log(one);
        var list = [];
        $(one.list).each(function() {
            var o = {};
            for (var k in one.rule) {
                switch (one.rule[k].type) {
                    case 'text':
                        o[k] = $(this).find(one.rule[k].text).text();
                        break;

                    case 'html':
                        o[k] = $(this).find(one.rule[k].text).html();
                        break;

                    case 'val':
                        o[k] = $(this).find(one.rule[k].text).val();
                        break;

                    default:
                        o[k] = $(this).find(one.rule[k].text).attr(one.rule[k].type);
                        break;
                }
            }
            list.push(o);
        });
        if (!one.link) {
            var l = {};
            l[one.key] = list;
            list = _.merge(one.data, l);
            cb(one, list);
        } else {
            list.forEach(function(li) {
                if (li.url) {
                    // console.log({ url: url(one.url, li.url), rules: one.link });
                    for (var i in one.link) {
                        one.link[i].url = Spider.prototype.url(url, li.url);
                    }
                    Spider.prototype.run(one.link, one.data);
                }
            });
        }
    }

    one(url, one, $, cb) {
        // console.trace();
        var o = {};
        for (var k in one.rule) {
            switch (one.rule[k].type) {
                case 'text':
                    o[k] = $(one.rule[k].text).text();
                    break;

                case 'html':
                    o[k] = $(one.rule[k].text).html();
                    break;

                case 'val':
                    o[k] = $(one.rule[k].text).val();
                    break;

                default:
                    o[k] = $(one.rule[k].text).attr(one.rule[k].type);
                    break;
            }
        }
        // console.log(one);
        o = _.merge(one.data, o);
        o.url = url;
        // console.log(o);
        cb(o);
    }

    url(url, t) {
        return /^https?:/.test(t) ? t : urlResolve(url, t);
    }

}

new Spider({
    init: {
        debug: true
    },
    // rules: ,
    callback: function(data) {
        // console.log('>>> ', data.title);
    },
    // run: true
}).run([{
    title: '破晓列表',
    url: 'http://www.poxiao.com/',
    rules: [{
        list: 'div#indextopleft div ul li',
        rule: {
            url: {
                type: 'href',
                text: 'a'
            }
        },
        link: [{
            title: '内容',
            rules: [{
                rule: {
                    title: {
                        type: 'text',
                        text: 'h1'
                    },
                    content: {
                        type: 'text',
                        text: 'div.filmcontents p'
                    }
                }
            }, {
                key: 'download',
                list: 'div.resourcesmain table tr',
                rule: {
                    title: {
                        type: 'text',
                        text: 'a'
                    },
                    address: {
                        type: 'val',
                        text: 'input'
                    }
                }
            }]
        }]
    }]
}]);