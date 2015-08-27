'use strict';

var postcss = require('postcss');
var comma = postcss.list.comma;
var plugin = 'postcss-plugin-context';

module.exports = postcss.plugin(plugin, function (plugins) {

    var getPlugin = function (name) {
        return plugins[Object.keys(plugins).filter(function (p) {
            return name === p;
        })[0]];
    };

    return function (css, result) {
        if (Object.prototype.toString.call(plugins) !== '[object Object]') {
            throw new Error(plugin + ' cannot be called on a non-object');
        }
        css.walkAtRules('context', function (rule) {
            comma(rule.params).forEach(function (ctx) {
                var method = getPlugin(ctx);
                if (method.postcss) {
                    method = method.postcss;
                }
                if (method) {
                    if (rule.nodes) {
                        method(rule, result);
                    } else {
                        method(css, result);
                    }
                    rule.each(function (r) {
                        r.remove();
                        rule.parent.insertBefore(rule, r);
                    });
                } else {
                    var err = 'No context was found for "' + ctx + '".';
                    throw rule.error(err, {plugin: plugin});
                }
            });
            rule.remove();
        });
    };
});
