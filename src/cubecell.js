/* jshint esnext: true */

// The color cube is made out of these cells
function CubeCell() {
  "use strict";

  let API = {};

  // Count of hits
  // (dividing the accumulators by this value gives the average color)
  API.hit_count = 0;

  // accumulators for color components
  API.r_acc = 0.0;
  API.g_acc = 0.0;
  API.b_acc = 0.0;

  return API;
}
