const path = require("path");

const cheerio = require("cheerio");
const colors = require("colors");
const trace = require("./trace");
const {
    execFileSync
} = require("child_process");

const getHtml = (url, init) => {
    return new Promise((resolve, reject) => {
        if (/^http/.test(url)) {
            try {
                let filename = `../bin/html-${process.platform}${process.platform === 'win32' ? '.exe' : ''}`;
                let cmd = path.join(__dirname, filename);
                let startTime = new Date().getTime();
                let result = execFileSync(cmd, [url]).toString();
                let stopTime = new Date().getTime();
                trace(
                    `${url} is use time: ${stopTime - startTime}ms.`.green,
                    init.debug
                );
                resolve(cheerio.load(result));
            } catch (ex) {
                reject(`[${url}] ${ex.message}`);
            }
        } else {
            reject(`这个地址 "${url}" 不是一个有效的地址!`);
        }
    });
};

const getHtmlWithNightmare = (url, init) => {
    return new Promise((resolve, reject) => {
        let NG = Nightmare({
            show: false
        });

        NG.useragent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
            ) // 必须设置浏览器信息
            .cookies.clearAll()
            // .viewport(window.width, window.height)
            .goto(url)
            .wait("body")
            .evaluate(() => {
                return document.body.innerHTML;
            })
            .end()
            .then(html => {
                resolve(cheerio.load(html))
            })
            .catch(e => {
                reject(e.message)
            })
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