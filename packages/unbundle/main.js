'use strict';
var task = require("./task");

module.exports = {
    load() {
        // 当 package 被正确加载的时候执行
    },

    unload() {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'unbundle-scripts-link'() {
            task.cpScripts("jsb-link");
        },
        'unbundle-scripts-default'() {
            task.cpScripts("jsb-default");
        }
    },
};