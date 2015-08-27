'use strict';

var test = require('tape');
var postcss = require('postcss');
var plugin = require('./');
var map = require('postcss-map');
var name = require('./package.json').name;

var tests = [{
    message: 'should contextualize a postcss processor',
    fixture: '@context foo{h1{bar:map(language)}}h1{baz:map(language)}',
    expected: 'h1{bar:node_js}h1{baz:map(language)}',
    options: {foo: map({maps: ['.travis.yml']})}
}, {
    message: 'should contextualize with the postcss sugar syntax',
    fixture: '@context size{h1{size:100px}}h2{size:100px}',
    expected: 'h1{width:100px;height:100px}h2{size:100px}',
    options: {size: require('postcss-size')}
}, {
    message: 'should contextualize across a whole file',
    fixture: '@context size;h1{size: 100px}h2{size: 100px}',
    expected: 'h1{width: 100px;height: 100px}h2{width: 100px;height: 100px}',
    options: {size: require('postcss-size')}
}];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

function processAsync (css, options, cb) {
    return postcss(plugin(options)).process(css).then(cb);
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

test('should receive warnings from result object', function (t) {
    t.plan(2);
    var options = {
        inline: require('postcss-import')({
            path: [__dirname]
        })
    };

    processAsync('@context inline { @import "./fixtures/empty"; }', options, function (result) {
        t.equal(result.css, '', 'should have empty output');
        t.equal(result.warnings().length, 1, 'should have warning from postcss-import');
    });
});

test('should work with async plugins', function (t) {
    t.plan(2);

    var options = {
        svgo: require('postcss-svgo')
    };

    var fixture = '@context svgo{h1{background:url(\'data:image/svg+xml;utf-8,<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"><circle cx="50" cy="50" r="40" fill="yellow" /><!--test comment--></svg>\')}}';
    var fixture2 = 'h1{background:url(\'data:image/svg+xml;utf-8,<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"><circle cx="50" cy="50" r="40" fill="yellow" /><!--test comment--></svg>\')}';
    var expected = 'h1{background:url(\'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#ff0"/></svg>\')}';

    processAsync(fixture, options, function (result) {
        t.equal(result.css, expected);
    });

    processAsync(fixture2, options, function (result) {
        t.equal(result.css, fixture2);
    });
});
