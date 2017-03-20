/**
 * Created by S2 on 2017/3/17.
 */

var needle = require('needle');

var spider = function(opts) {
    var def = [{
        title: 'default',
        list: true,
        url: 'http://baidu.com',
        rule: [{
            title: '',
            url: '',
            link: {
                where: 'order', // ['order': '按照顺序，当第一条不存在内容时，进行下一个', 'repeat': '重复获取']
                to: [{
                title: 'default1',
                list: false,
                rule: [{
                    title: '',
                    content: '',
                    url: '',
                    link: {
                        where: 'order',
                        to: []
                    }
                }]
            }]}
        }]
    }];
    this.rule = opts.rule || def;
    this.cb = opts.cb;
    if(opts.run) this.run();
    return this;
};

spider.prototype.run = function() {
    this.rule.forEach(function(v, k, a) {
        this.web(v.url, function(data) {
            if(data) {
                this.get(v, function(data) {

                });
            }
        });
    });
};

spider.prototype.get = function(i) {
    if(i.list && i.list.length >= 1) {
        i.list.forEach(function(v, k, a) {
            this.web(v.url, function(data) {

            });
        });
    }
};

spider.prototype.web = function(url, cb) {

};

exports = module.exports = spider;