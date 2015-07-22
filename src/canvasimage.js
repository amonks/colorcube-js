/* jshint esnext: true */

/*
  CanvasImage Class
  Class that wraps the html image element and canvas.
  It also simplifies some of the canvas context manipulation
  with a set of helper functions.

  modified from Color Thief v2.0
  by Lokesh Dhakar - http://www.lokeshdhakar.com
*/
var CanvasImage = function (image) {
  "use strict";

  if (! image instanceof HTMLElement) {
    throw "You've gotta use an html image element as ur input!!";
  }

  let API = {};

  let canvas  = document.createElement('canvas');
  let context = canvas.getContext('2d');

  // document.body.appendChild(canvas);

  canvas.width  = image.width;
  canvas.height = image.height;

  context.drawImage(image, 0, 0, image.width, image.height);

  API.getImageData = () => {
    return context.getImageData(0, 0, image.width, image.height);
  };

  return API;
};
