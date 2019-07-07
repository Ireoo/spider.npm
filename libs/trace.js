require("colors");
const _ = require("lodash");

const trace = (text, debug = false) => {
    if (debug)
        console.log(
            `DEBUG > `.bold.yellow +
            `${_.isString(text) ? text : JSON.stringify(text)}`
        );
};

exports = module.exports = trace;