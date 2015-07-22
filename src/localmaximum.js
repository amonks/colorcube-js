/* jshint esnext: true */

// Local maxima as found during the image analysis.
// We need this class for ordering by cell hit count.
function LocalMaximum(hit_count, cell_index, r, g, b) {
  "use strict";

  let API = {};

  // hit count of the cell
  API.hit_count = hit_count;

  // linear index of the cell
  API.cell_index = cell_index;

  // average color of the cell
  API.r = r;
  API.g = g;
  API.b = b;

  return API;
}
