const _ = require("lodash");

const moreEach = (more, cb) => {
    if (_.isArray(more)) {
        more.forEach(cb);
    } else {
        cb(more);
    }
};

exports = module.exports = moreEach;