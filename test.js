var test = require('tape');
var postcss = require('postcss');
var plugin = require('./');
var map = require('postcss-map');
var name = require('./package.json').name;

var tests = [{
    message: 'should contextualize a postcss processor',
    fixture: '@context foo { h1 { bar: map(language) } } h1 { baz: map(language) }',
    expected: 'h1 { bar: node_js } h1 { baz: map(language) }',
    options: {foo: map({maps: ['.travis.yml']})}
}, {
    message: 'should contextualize with the postcss sugar syntax',
    fixture: '@context size { h1 { size: 100px } } h2 { size: 100px }',
    expected: 'h1 { width: 100px; height: 100px } h2 { size: 100px }',
    options: {size: require('postcss-size')}
}, {
    message: 'should contextualize across a whole file',
    fixture: '@context size; h1 { size: 100px } h2 { size: 100px }',
    expected: 'h1 { width: 100px; height: 100px } h2 { width: 100px; height: 100px }',
    options: {size: require('postcss-size')}
}];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

test(name, function (t) {
    t.plan(tests.length);

    tests.forEach(function (test) {
        var options = test.options || {};
        t.equal(process(test.fixture, options), test.expected, test.message);
    });
});

test('should throw on undefined processor', function (t) {
    t.plan(1);
    t.throws(function () {
        return process('@context bar { h1 { color: red } }', {});
    }, 'should throw because the "bar" context is undefined');
});

test('should throw on invalid options', function (t) {
    t.plan(2);
    t.throws(function () {
        return process('@context foo { h1 { color: red }}');
    }, 'should throw when no options were passed');
    t.throws(function () {
        return process('@context foo { h1 { color: red }}', [map]);
    }, 'should throw when options were not typeof object');
});

test('should use the postcss plugin api', function (t) {
    t.plan(2);
    t.ok(plugin().postcssVersion, 'should be able to access version');
    t.equal(plugin().postcssPlugin, name, 'should be able to access name');
});
