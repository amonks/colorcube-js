# colorcube.js

this is ajavascript port of [ColorCube](https://github.com/pixelogik/ColorCube), by Ole Krause-Sparmann.

ColorCube is for dominant color extraction from RGB images

## usage

```js
let cc = new ColorCube(30); // 30 is the resolution
let image = document.getElementById("image");
let colors = cc.get_colors(image);
console.log(colors);
```

## TODO

-   [x] copy the python code over
-   [x] deal with canvasizing images
-   [x] document usage
-   [x] transpile out all the es7 features I'm using...
-   [ ] clean up API // hide more information
