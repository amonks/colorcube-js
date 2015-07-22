# colorcube.js

## [demo](http://amonks.github.io/colorcube-js/)

This is a JavaScript port of [ColorCube](https://github.com/pixelogik/ColorCube), by Ole Krause-Sparmann. You can find an excellent description of how it works at [that repo](https://github.com/pixelogik/ColorCube)

ColorCube is for dominant color extraction from RGB images. Given an image element, it returns a sorted array of hex colors.

## usage

```js
var cc = new ColorCube( // all arguments are optional; these are the defaults:
  20,   // color-space resolution
  0.2,  // brightness threshold
  0.4   // distinctness threshold
);
var image = document.getElementById("image");
var colors = cc.get_colors(image);
```

## info/caveat

colorcube-js has no dependencies. Not even jQuery! However...

colorcube-js's source uses several ES6 features (default arguments, for/of, let, arrow functions ((for lexical `this`)) ). The files in `dist` have been automagically run through [babel](http://babeljs.io/), which makes it run in current versions of Chrome and Firefox. (Not even Chrome Canary can handle the un-babelfied code).

Even with Babel, colorcube still uses [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), which is [supported](https://kangax.github.io/compat-table/es6/#Symbol) by current versions of Chrome and Firefox but not Safari.

There are multiple polyfills available to add Symbol to browsers that don't support it natively. [es6-symbol](https://github.com/medikoo/es6-symbol) is likely the smallest.

In the demo page, I use [core-js](https://github.com/zloirock/core-js) because it was easy to CDN in.

Babel maintains their own [polyfill](http://babeljs.io/docs/advanced/caveats/), which would work also.

## alternatives

There are several other options for in-browser color extraction. I like this one best because it is small and easy to understand. (Props again to Ole Krause-Sparmann for the excellent algorithm).

*   [vibrant.js](http://jariz.github.io/vibrant.js/) is based on Android's support library
*   [color thief](http://lokeshdhakar.com/projects/color-thief/) works by color quantizing
*   [jquery.adaptive-backgrounds.js](https://github.com/briangonzalez/jquery.adaptive-backgrounds.js) is even smaller than colorcube-js but requires jQuery
