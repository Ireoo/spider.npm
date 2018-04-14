"use strict";

const config = require("./test/config");
const _ = require("lodash");
const urlResolve = require("url").resolve;
const base = require("getlibs.io")();
const queuefun = require("queue-fun");
const Queue = queuefun.Queue();
const colors = require("colors");

class Spider {
    constructor(options) {
        let self = this;
        if (options) {
            self.init = _.merge({
                    debug: false,
                    delay: 1000,
                    timeout: 5000,
                    threads: 1,
                    retrys: 3,
                    loop: false,
                    userAgent: "Mozilla/5.0 (compatible; spider.io/4.0+; +https://www.npmjs.com/package/spider.io)"
                },
                options.init
            );
            self.links = options.links || config;
            if (options.callback) self.cb = options.callback;
            if (options.done) self.done = options.done;
            if (options.run) self.run(self.links);
            self.Q = new Queue(self.init.threads, {
                event_err: err => {
                    base.trace(
                        `线程出错，错误代码: ${JSON.stringify(err)}`.red,
                        self.init.debug
                    );
                },
                event_end: function() {
                    if (self.realyDone) {
                        self.done();
                        if (self.init.loop) self.run(self.links);
                    } else {
                        self.realyDone = true;
                    }
                },
                retryON: self.init.retrys,
                retryType: false
            });
        } else {
            console.log("没有设置基础参数!");
        }
        return self;
    }

    run(links) {
        if (links) this.links = links;

        let linksIsOnce = true;
        base.moreEach(this.links, link => {
            base.moreEach(link.rules, rule => {
                if (rule.links) linksIsOnce = false;
            });
        });

        this.realyDone = linksIsOnce;
        this.go(links || this.links);
    }

    go(links, input = {}) {
        let self = this;
        base.moreEach(links, link => {
            if (!link) return;
            let hash = link.hash;
            base.urlsEach(link, once => {
                self.linkIsSequence(once, async one => {
                    self.Q.go(base.getHtml, [one.url, self.init]).then($ => {
                        let data = {};
                        base.moreEach(one.rules, rule => {
                            if (rule.key) {
                                data[rule.key] = rule.list ?
                                    base.list(rule, $) :
                                    base.data(rule, $);
                            } else {
                                data = rule.list ?
                                    base.list(rule, $) :
                                    base.data(rule, $);
                            }
                        });

                        base.moreEach(data, d => {
                            for (let i in input) {
                                d[i] = input[i];
                            }
                            let out = true;
                            base.moreEach(one.rules, rule => {
                                if (rule.links) {
                                    out = false;
                                    let _links = JSON.parse(
                                        JSON.stringify(rule.links)
                                    ).map(l => {
                                        l.url = self.url(one.url, d.url);
                                        l.hash = link.hash;
                                        return l;
                                    });
                                    self.go(_links, d);
                                }
                            });
                            if (out) {
                                self.cb(hash || false, d);
                            }
                        });
                    });
                });
            });
        });
        return self;
    }

    setThreads(threads) {
        this.Q.setMax(threads);
    }

    linkIsSequence(link, cb) {
        if (link.max) {
            for (let g = link.min || 1; g <= link.max; g++) {
                cb(JSON.parse(JSON.stringify(link)).url.replace(/{i}/, g));
            }
        } else {
            cb(link);
        }
    }

    url(url, t) {
        return /^https?:/.test(t) ? t : urlResolve(url, t);
    }
}

exports = module.exports = Spider;