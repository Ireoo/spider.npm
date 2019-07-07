const _ = require("lodash");

const list = (rules, $, init) => {
    if (rules.cb) return rules.cb($, init);
    let list = [];
    $(rules.list).each(function() {
        let one;
        if (_.isString(rules.rule)) {
            one = $(this).attr(rules.rule);
        } else {
            one = {};
            for (let k in rules.rule) {
                if (rules.rule[k].text && rules.rule[k].text != "") {
                    switch (rules.rule[k].type) {
                        case "text":
                            if (
                                $(this)
                                .find(rules.rule[k].text)
                                .text()
                            )
                                one[k] = $(this)
                                .find(rules.rule[k].text)
                                .text();
                            break;

                        case "html":
                            if (
                                $(this)
                                .find(rules.rule[k].text)
                                .html()
                            )
                                one[k] = $(this)
                                .find(rules.rule[k].text)
                                .html();
                            break;

                        case "val":
                            if (
                                $(this)
                                .find(rules.rule[k].text)
                                .val()
                            )
                                one[k] = $(this)
                                .find(rules.rule[k].text)
                                .val();
                            break;

                        default:
                            if (
                                $(this)
                                .find(rules.rule[k].text)
                                .attr(rules.rule[k].type)
                            )
                                one[k] = $(this)
                                .find(rules.rule[k].text)
                                .attr(rules.rule[k].type);
                            break;
                    }
                } else {
                    switch (rules.rule[k].type) {
                        case "text":
                            if ($(this).text()) one[k] = $(this).text();
                            break;

                        case "html":
                            if ($(this).html()) one[k] = $(this).html();
                            break;

                        case "val":
                            if ($(this).val()) one[k] = $(this).val();
                            break;

                        default:
                            if ($(this).attr(rules.rule[k].type))
                                one[k] = $(this).attr(rules.rule[k].type);
                            break;
                    }
                }
            }
        }
        list.push(one);
    });
    return list;
};

const data = (rules, $, init) => {
    if (rules.cb) return rules.cb($, init);
    let data = {};
    for (let k in rules.rule) {
        switch (rules.rule[k].type) {
            case "text":
                if ($(rules.rule[k].text).text())
                    data[k] = $(rules.rule[k].text).text();
                break;

            case "html":
                if ($(rules.rule[k].text).html())
                    data[k] = $(rules.rule[k].text).html();
                break;

            case "val":
                if ($(rules.rule[k].text).val()) data[k] = $(rules.rule[k].text).val();
                break;

            default:
                if ($(rules.rule[k].text).attr(rules.rule[k].type))
                    data[k] = $(rules.rule[k].text).attr(rules.rule[k].type);
                break;
        }
    }
    return data;
};

exports = module.exports = {
    list,
    data
};