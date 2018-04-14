const colors = require("colors");

const trace = (text, debug = false) => {
    if (debug)
        console.log(
            `DEBUG > `.bold.yellow +
            `${typeof text === "string" ? text : JSON.stringify(text)}`
        );
};

exports = module.exports = trace;