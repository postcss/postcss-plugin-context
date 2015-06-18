'use strict';

var postcss = require('postcss');
var comma = postcss.list.comma;
var plugin = 'postcss-plugin-context';

module.exports = postcss.plugin(plugin, function (plugins) {

    var getPlugin = function (name) {
        return plugins[Object.keys(plugins).filter(function (plugin) {
            return name === plugin;
        })[0]];
    };

    return function (css) {
        if (Object.prototype.toString.call(plugins) !== '[object Object]') {
            throw new Error(plugin + ' cannot be called on a non-object');
        }
        css.eachAtRule('context', function (rule) {
            comma(rule.params).forEach(function (ctx) {
                var method = getPlugin(ctx);
                if (method) {
                    if (rule.nodes) {
                        method(rule);
                    } else {
                        method(css);
                    }
                    rule.each(function (r) { r.moveBefore(rule); });
                } else {
                    var err = 'No context was found for "' + ctx + '".';
                    throw rule.error(err, {plugin: plugin});
                }
            });
            rule.removeSelf();
        });
    }
});
