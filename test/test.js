/**
 * Created by Ireoo on 2017/3/28.
 */
"use strict";

var Spider = require('../net.js');

// console.profile('性能分析器');
var spider = new Spider({
	init: {
		debug: true
	},
	rules: [{
		title: '破晓列表',
		url: 'http://www.iqiyi.com/lib/dianying/%2C%2C_4_1.html',
		rules: [{
			list: 'ul.site-piclist li',
			rule: {
				url: {
					type: 'href',
					text: 'a'
				},
				title: {
					type: 'text',
					text: 'p.site-piclist_info_title a'
				}
			},
			link: [{
				title: '内容',
				rules: [{
					rule: {
						title: {
							type: 'text',
							text: 'h1.main_title a'
						},
						content: {
							type: 'text',
							text: 'div.mod-body.introduce-info p'
						}
					}
				}, {
					key: 'image',
					list: 'ul.site-piclist.search-piclist-100100 li',
					rule: {
						address: {
							type: 'src',
							text: 'img'
						}
					}
				}]
			}]
		}]
	}],
	callback: function(data) {
		console.log('>>> ', JSON.stringify(data));
	},
	run: true
});
