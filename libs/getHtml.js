const superagent = require("superagent");
const cheerio = require("cheerio");
const colors = require("colors");
const trace = require("./trace");

const getHtml = (url, init) => {
    return new Promise((resolve, reject) => {
        if (/^http/.test(url)) {
            let startTime = new Date().getTime();
            superagent.get(url).end((err, res) => {
                let stopTime = new Date().getTime();
                if (err) {
                    return reject(err, url);
                }
                trace(
                    `${url} is use time: ${stopTime - startTime}ms.`.green +
                    `\n${JSON.stringify(res.header, null, 4)}`.grey,
                    init.debug
                );
                try {
                    let $ = cheerio.load(res.text);
                    resolve($);
                } catch (e) {
                    reject(`这个地址 "${url}" 的内容无法被解析!详细错误信息：${e}`);
                }
            });
        } else {
            reject(`这个地址 "${url}" 不是一个有效的地址!`);
        }
    });
};

const delayGetHtml = (url, init) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            getHtml(url, init)
                .then(resolve)
                .catch(reject);
        }, init.delay);
    });
};

exports = module.exports = delayGetHtml;
