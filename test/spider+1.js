"use strict";

var needle = require('needle');
var cheerio = require('cheerio');
var config = require('../config');
var _ = require('lodash');
var urlResolve = require('url').resolve;



var time = 3 * 1000;

needle.defaults({
	open_timeout: time,
	read_timeout: time,
	timeout: time,
	user_agent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; SV1; .NET CLR 1.1.4322)'
});

class Spider {
	constructor(opts) {
		Spider.prototype.init = _.merge({
			debug: false,
			delay: 0,
			threads: 1
		}, opts.init);
        Spider.prototype.callback = opts.callback;
		if (opts.run) Spider.prototype.run(opts.rules);
	}

	run(rules, data) {
		if (data === undefined) data = {};
		// console.log(rules, data);
		if (!rules && !data) {
			console.log('没有规则,将启动测试程序!');
		}
		this.once({
			rules: rules || config,
			data: data
		}, function(once) {
			// console.log(once);
			Spider.prototype.get(once.url, once, function(once, html) {
				// console.log(once);
				Spider.prototype.once(once, function(one) {
					// console.log(one);
					if (one.list) {
						if (Spider.prototype.init.debug) console.info("[+] [" + once.url + "]运行规则中...");
						// console.dir(one);
						Spider.prototype.list(one, html, function(o, data) {
							// console.log(o);
							// sleep(this.init.delay);
							if (!one.link) {
								// Spider.prototype.callback(data);
							}
						});
					} else {
						if (Spider.prototype.init.debug) console.info("[+] [" + once.url + "]正在获取数据...");
						Spider.prototype.one(once.url, one, html, function(data) {
							if (Spider.prototype.init.debug) console.info("[+] [" + data.url + "]获取数据完成.");
							Spider.prototype.callback(data);
						});
					}
				});
			});
		});
	}

	list(one, $, cb) {
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
						one.link[i].url = Spider.prototype.url(one.url, li.url);
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

	get(url, source, cb) {
		// console.log(url);
		if (Spider.prototype.init.debug) console.time("[+] [" + url + "]网页获取时间");
		needle.get(url, function(err, res) {
			// console.log(url, source);
			if (!err) {
				try {
					if (Spider.prototype.init.debug) console.info("[+] [" + url + "]页面处理完成.");
					source.url = url;
					cb(source, cheerio.load(res.body));
				} catch (e) {
					if (Spider.prototype.init.debug) console.error("[-] [" + url + "]页面处理失败: ", e);
				}
			} else {
				if (Spider.prototype.init.debug) console.error("[-] [" + url + "]网页访问错误: ", err);
			}
			if (Spider.prototype.init.debug) console.timeEnd("[+] [" + url + "]网页获取时间");
		});
	}

	once(more, cb) {
		if (_.isArray(more.rules)) {
			more.rules.forEach(function(once) {
				// console.info(once);
				if (!once.url) once.url = more.url;
				once.data = more.data;
				cb(once);
			});
		} else {
			// console.info(more);
			var rule = more.rules;
			rule.url = more.url;
			rule.data = more.data;
			cb(rule);
		}
	}

    url(url, t) {
    return /^https?:/.test(t) ? t : urlResolve(url, t);
}
}

// exports = module.exports = Spider;

var s = new Spider({
	init: {
		debug: true
	},
	// rules: ,
	callback: function(data) {
		console.log('>>> ', data.url);
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
// console.log(s);
