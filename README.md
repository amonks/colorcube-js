# colorcube.js

this is ajavascript port of [ColorCube](https://github.com/pixelogik/ColorCube), by Ole Krause-Sparmann.

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
