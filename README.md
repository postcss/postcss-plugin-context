# [postcss]-plugin-context [![Build Status](https://travis-ci.org/postcss/postcss-plugin-context.svg?branch=master)][ci]

> Limit a PostCSS processor to a local stylesheet context.

## Install

With [npm](https://npmjs.org/package/postcss-plugin-context) do:

```
npm install postcss-plugin-context --save
```

## Example

This plugin is useful should you need to contextualize another processor inside
your CSS file. For example, [`postcss-map`] will allow you to specify a short
syntax if only one file is specified. Using this module, we can limit the scope
of the transform to be of our choice, rather than the module's. In this example,
only the first ruleset is actually passed to postcss-map, and the rest of the
CSS file is untouched.

Simply define a `@context` block inside your CSS file, such as:

```css
@context brandColors {
    h1 {
        color: map(primary);
    }
}
```

Then, the plugin will work on the `brandColors` context. The `@context` block is
removed automatically for you after the fact.

```js
var postcss = require('postcss');
var map = require('postcss-map');
var context = require('postcss-plugin-context');

var css = '@context brandColors { h1 { color: map(primary) } } h2 { color: map(primary) }';
console.log(postcss([
    context({
        brandColors: map({
            maps: ['brand.yml']
        })
    })
]).process(css).css);

// => 'h1 { color: red } h2 { color: map(primary) }'
```

Note that you can pass multiple processors to a single context block:

```css
h1 {
    @context brandColors, size {
        color: map(primary);
        size: 100px;
    }
}
```

Outputs:

```css
h1 {
    color: red;
    width: 100px;
    height: 100px;
}
```

Note that a context may also be defined across a whole file; if you specify
`@context` without curly braces. For example:

```css
@context size;

h1 {
    size: 100px;
}
```

Outputs:

```css
h1 {
    width: 100px;
    height: 100px;
}
```

## API

### context(plugins)

#### plugins

Type: `object`
*Required value*.

Pass an object of processors to contextualize.

```js
context({
    brandColors: map({maps: ['brand.yml']})
    size: require('postcss-size')
});
```

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.

## License

MIT © [Ben Briggs](http://beneb.info)

[ci]:            https://travis-ci.org/postcss/postcss-plugin-context
[postcss]:       https://github.com/postcss/postcss
[`postcss-map`]: https://github.com/pascalduez/postcss-map
