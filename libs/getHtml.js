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
                resolve(cheerio.load(res.text));
            });
        } else {
            reject(`This url '${url}' is not url!`);
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