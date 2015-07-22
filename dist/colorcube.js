/*
Copyright (c) 2015, Ole Krause-Sparmann,
                    Andrew Monks <a@monks.co>
Permission to use, copy, modify, and/or distribute this software for
any purpose with or without fee is hereby granted, provided that the
above copyright notice and this permission notice appear in all
copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL
DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR
PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
*/

/* jshint esnext: true */

/*
ColorCube Class

  Uses a 3d RGB histogram to find local maximas in the density distribution
  in order to retrieve dominant colors of pixel images
*/
"use strict";

function ColorCube() {
  "use strict";

  // subclasses   // // // // // // // // // // // // // // // // // // // //
  // // // // // // // // // // // // // // // // // // // // // // // // //

  /*
  CanvasImage Class
     Class that wraps the html image element and canvas.
    It also simplifies some of the canvas context manipulation
    with a set of helper functions.
     modified from Color Thief v2.0
    by Lokesh Dhakar - http://www.lokeshdhakar.com
  */
  var resolution = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];

  var _this = this;

  var bright_threshold = arguments.length <= 1 || arguments[1] === undefined ? 0.2 : arguments[1];
  var distinct_threshold = arguments.length <= 2 || arguments[2] === undefined ? 0.4 : arguments[2];
  var CanvasImage = function CanvasImage(image) {

    if (!image instanceof HTMLElement) {
      throw "You've gotta use an html image element as ur input!!";
    }

    var API = {};

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // document.body.appendChild(canvas);

    canvas.width = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0, image.width, image.height);

    API.getImageData = function () {
      return context.getImageData(0, 0, image.width, image.height);
    };

    return API;
  };

  /*
  CubeCell Class
     class that represents one voxel within rgb colorspace
  */
  function CubeCell() {
    var API = {};

    // Count of hits
    // (dividing the accumulators by this value gives the average color)
    API.hit_count = 0;

    // accumulators for color components
    API.r_acc = 0.0;
    API.g_acc = 0.0;
    API.b_acc = 0.0;

    return API;
  }

  /*
  LocalMaximum Class
     Local maxima as found during the image analysis.
    We need this class for ordering by cell hit count.
  */
  function LocalMaximum(hit_count, cell_index, r, g, b) {
    var API = {};

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

  // ColorCube    // // // // // // // // // // // // // // // // // // // //
  // // // // // // // // // // // // // // // // // // // // // // // // //

  var API = {};

  // helper variable to have cell count handy
  var cell_count = resolution * resolution * resolution;

  // create cells
  var cells = [];
  for (var i = 0; i <= cell_count; i++) {
    cells.push(new CubeCell());
  }

  // indices for neighbor cells in three dimensional grid
  var neighbour_indices = [[0, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, 1, 1], [0, 1, -1], [0, -1, 0], [0, -1, 1], [0, -1, -1], [1, 0, 0], [1, 0, 1], [1, 0, -1], [1, 1, 0], [1, 1, 1], [1, 1, -1], [1, -1, 0], [1, -1, 1], [1, -1, -1], [-1, 0, 0], [-1, 0, 1], [-1, 0, -1], [-1, 1, 0], [-1, 1, 1], [-1, 1, -1], [-1, -1, 0], [-1, -1, 1], [-1, -1, -1]];

  // returns linear index for cell with given 3d index
  var cell_index = function cell_index(r, g, b) {
    return r + g * resolution + b * resolution * resolution;
  };

  var clear_cells = function clear_cells() {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        cell.hit_count = 0;
        cell.r_acc = 0;
        cell.g_acc = 0;
        cell.b_acc = 0;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  API.get_colors = function (image) {
    var canvasimage = new CanvasImage(image);

    var m = find_local_maxima(canvasimage);

    m = filter_distinct_maxima(m);

    var colors = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = m[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var n = _step2.value;

        var r = Math.round(n.r * 255.0);
        var g = Math.round(n.g * 255.0);
        var b = Math.round(n.b * 255.0);
        var color = rgbToHex(r, g, b);
        if (color === "#NaNNaNNaN") {
          continue;
        }
        colors.push(color);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return colors;
  };

  var componentToHex = function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  var rgbToHex = function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  // finds and returns local maxima in 3d histogram, sorted by hit count
  var find_local_maxima = function find_local_maxima(image) {
    // reset all cells
    clear_cells();

    // get the image pixels
    var data = image.getImageData().data;

    // iterate over all pixels of the image
    for (var i = 0; i < data.length; i += 4) {
      // get color components
      var red = data[i] / 255.0;
      var green = data[i + 1] / 255.0;
      var blue = data[i + 2] / 255.0;
      var alpha = data[i + 3] / 255.0;

      // stop if brightnesses are all below threshold
      if (red < bright_threshold && green < bright_threshold && blue < bright_threshold) {}
      // continue;

      // weigh colors by alpha channel
      red *= alpha;
      green *= alpha;
      blue *= alpha;

      // map color components to cell indicies in each color dimension
      // TODO maybe this should round down? OG colorcube uses python's int()
      var _r_index = Math.round(red * (resolution - 1.0));
      var _g_index = Math.round(green * (resolution - 1.0));
      var _b_index = Math.round(blue * (resolution - 1.0));

      // compute linear cell index
      var index = cell_index(_r_index, _g_index, _b_index);

      // increase hit count of cell
      cells[index].hit_count += 1;

      // add pixel colors to cell color accumulators
      cells[index].r_acc += red;
      cells[index].g_acc += green;
      cells[index].b_acc += blue;
    }

    // we collect local maxima in here
    var local_maxima = [];

    // find local maxima in the grid
    for (var r = 0; r < resolution; r++) {
      for (var g = 0; g < resolution; g++) {
        for (var b = 0; b < resolution; b++) {

          var local_index = cell_index(r, g, b);

          // get hit count of this cell
          var local_hit_count = cells[local_index].hit_count;

          // if this cell has no hits, ignore it
          if (local_hit_count === 0) {
            continue;
          }

          // it's a local maxima until we find a neighbor with a higher hit count
          var is_local_maximum = true;

          // check if any neighbor has a higher hit count, if so, no local maxima
          for (var n in new Array(27)) {
            r_index = r + _this.neighbor_indices[n][0];
            g_index = g + _this.neighbor_indices[n][1];
            b_index = b + _this.neighbor_indices[n][2];

            // only check valid cell indices
            if (r_index >= 0 && g_index >= 0 && b_index >= 0) {
              if (r_index < _this.resolution && g_index < _this.resolution && b_index < _this.resolution) {
                if (_this.cells[_this.cell_index(r_index, g_index, b_index)].hit_count > local_hit_count) {
                  // this is not a local maximum
                  is_local_maximum = false;
                  break;
                }
              }
            }
          }

          // if this is not a local maximum, continue with loop
          if (is_local_maximum === false) {
            continue;
          }

          // otherwise add this cell as a local maximum
          var avg_r = cells[local_index].r_acc / cells[local_index].hit_count;
          var avg_g = cells[local_index].g_acc / cells[local_index].hit_count;
          var avg_b = cells[local_index].b_acc / cells[local_index].hit_count;
          var localmaximum = new LocalMaximum(local_hit_count, local_index, avg_r, avg_g, avg_b);

          local_maxima.push(localmaximum);
        }
      }
    }

    // return local maxima sorted with respect to hit count
    local_maxima = local_maxima.sort(function (a, b) {
      return b.hit_count - a.hit_count;
    });

    return local_maxima;
  };

  // Returns a filtered version of the specified array of maxima,
  // in which all entries have a minimum distance of distinct_threshold
  var filter_distinct_maxima = function filter_distinct_maxima(maxima) {

    var result = [];

    // check for each maximum
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = maxima[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var m = _step3.value;

        // this color is distinct until an earlier color is too close
        var is_distinct = true;

        var _iteratorNormalCompletion4 = true;

        // add to filtered array if is distinct
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = result[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var n = _step4.value;

            // compute delta components
            var r_delta = m.r - n.r;
            var g_delta = m.g - n.g;
            var b_delta = m.b - n.b;

            // compute delta in color space distance
            var delta = Math.sqrt(r_delta * r_delta + g_delta * g_delta + b_delta * b_delta);

            // if too close, mark as non distinct and break inner loop
            if (delta < distinct_threshold) {
              is_distinct = false;
              break;
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        if (is_distinct === true) {
          result.push(m);
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
          _iterator3["return"]();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return result;
  };

  return API;
}
//# sourceMappingURL=colorcube.js.map
