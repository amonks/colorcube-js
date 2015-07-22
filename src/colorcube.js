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
function ColorCube( resolution = 20,
                    bright_threshold = 0.2,
                    distinct_threshold = 0.4 ) {
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
  let CanvasImage = function (image) {

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




  /*
  CubeCell Class

    class that represents one voxel within rgb colorspace
  */
  function CubeCell() {
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




  /*
  LocalMaximum Class

    Local maxima as found during the image analysis.
    We need this class for ordering by cell hit count.
  */
  function LocalMaximum(hit_count, cell_index, r, g, b) {
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





  // ColorCube    // // // // // // // // // // // // // // // // // // // //
  // // // // // // // // // // // // // // // // // // // // // // // // //




  let API = {};

  // helper variable to have cell count handy
  let cell_count = resolution * resolution * resolution;

  // create cells
  let cells = [];
  for (let i = 0; i <=  cell_count; i++) {
    cells.push( new CubeCell() );
  }

  // indices for neighbor cells in three dimensional grid
  let neighbour_indices = [
    [ 0, 0, 0],
    [ 0, 0, 1],
    [ 0, 0,-1],

    [ 0, 1, 0],
    [ 0, 1, 1],
    [ 0, 1,-1],

    [ 0,-1, 0],
    [ 0,-1, 1],
    [ 0,-1,-1],

    [ 1, 0, 0],
    [ 1, 0, 1],
    [ 1, 0,-1],

    [ 1, 1, 0],
    [ 1, 1, 1],
    [ 1, 1,-1],

    [ 1,-1, 0],
    [ 1,-1, 1],
    [ 1,-1,-1],

    [-1, 0, 0],
    [-1, 0, 1],
    [-1, 0,-1],

    [-1, 1, 0],
    [-1, 1, 1],
    [-1, 1,-1],

    [-1,-1, 0],
    [-1,-1, 1],
    [-1,-1,-1]
  ];

  // returns linear index for cell with given 3d index
  let cell_index = (r, g, b) => {
    return (r + g * resolution + b * resolution * resolution);
  };

  let clear_cells = () => {
    for (let cell of cells) {
      cell.hit_count = 0;
      cell.r_acc = 0;
      cell.g_acc = 0;
      cell.b_acc = 0;
    }
  };

  API.get_colors = (image) => {
    let canvasimage = new CanvasImage(image);

    let m = find_local_maxima(canvasimage);

    m = filter_distinct_maxima(m);

    let colors = [];
    for (let n of m) {
      let r = Math.round(n.r * 255.0);
      let g = Math.round(n.g * 255.0);
      let b = Math.round(n.b * 255.0);
      let color = rgbToHex(r, g, b);
      if (color === "#NaNNaNNaN") {continue;}
      colors.push(color);
    }

    return colors;
  };

  let componentToHex = (c) => {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  let rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  // finds and returns local maxima in 3d histogram, sorted by hit count
  let find_local_maxima = (image) => {
    // reset all cells
    clear_cells();

    // get the image pixels
    let data = image.getImageData().data;

    // iterate over all pixels of the image
    for(let i = 0; i < data.length; i += 4) {
      // get color components
      let red = data[i] / 255.0;
      let green = data[i+1] / 255.0;
      let blue = data[i+2] / 255.0;
      let alpha = data[i+3] / 255.0;

      // stop if brightnesses are all below threshold
      if (red < bright_threshold &&
          green < bright_threshold &&
          blue < bright_threshold) {
        // continue;
      }

      // weigh colors by alpha channel
      red *= alpha;
      green *= alpha;
      blue *= alpha;

      // map color components to cell indicies in each color dimension
      // TODO maybe this should round down? OG colorcube uses python's int()
      let r_index = Math.round( red * ( resolution - 1.0 ) );
      let g_index = Math.round( green * ( resolution - 1.0 ) );
      let b_index = Math.round( blue * ( resolution - 1.0 ) );

      // compute linear cell index
      let index = cell_index(r_index, g_index, b_index);

      // increase hit count of cell
      cells[index].hit_count += 1;

      // add pixel colors to cell color accumulators
      cells[index].r_acc += red;
      cells[index].g_acc += green;
      cells[index].b_acc += blue;
    }

    // we collect local maxima in here
    let local_maxima = [];

    // find local maxima in the grid
    for (let r = 0; r < resolution; r++) {
      for (let g = 0; g < resolution; g++) {
        for (let b = 0; b < resolution; b++) {

          let local_index = cell_index(r, g, b);

          // get hit count of this cell
          let local_hit_count = cells[local_index].hit_count;

          // if this cell has no hits, ignore it
          if (local_hit_count === 0) {
            continue;
          }

          // it's a local maxima until we find a neighbor with a higher hit count
          let is_local_maximum = true;

          // check if any neighbor has a higher hit count, if so, no local maxima
          for (let n in new Array(27)) {
            r_index = r + this.neighbor_indices[n][0];
            g_index = g + this.neighbor_indices[n][1];
            b_index = b + this.neighbor_indices[n][2];

            // only check valid cell indices
            if (r_index >= 0 && g_index >= 0 && b_index >= 0) {
              if (r_index < this.resolution && g_index < this.resolution && b_index < this.resolution) {
                if (this.cells[this.cell_index(r_index, g_index, b_index)].hit_count > local_hit_count) {
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
          let avg_r = cells[local_index].r_acc / cells[local_index].hit_count;
          let avg_g = cells[local_index].g_acc / cells[local_index].hit_count;
          let avg_b = cells[local_index].b_acc / cells[local_index].hit_count;
          let localmaximum = new LocalMaximum(local_hit_count, local_index, avg_r, avg_g, avg_b);

          local_maxima.push( localmaximum );
        }
      }
    }

    // return local maxima sorted with respect to hit count
    local_maxima = local_maxima.sort(function(a, b) { return b.hit_count - a.hit_count; });

    return local_maxima;
  };

  // Returns a filtered version of the specified array of maxima,
  // in which all entries have a minimum distance of distinct_threshold
  let filter_distinct_maxima = (maxima) => {

    let result = [];

    // check for each maximum
    for (let m of maxima) {
      // this color is distinct until an earlier color is too close
      let is_distinct = true;

      for (let n of result) {
        // compute delta components
        let r_delta = m.r - n.r;
        let g_delta = m.g - n.g;
        let b_delta = m.b - n.b;

        // compute delta in color space distance
        let delta = Math.sqrt(r_delta * r_delta + g_delta * g_delta + b_delta * b_delta);

        // if too close, mark as non distinct and break inner loop
        if (delta < distinct_threshold) {
          is_distinct = false;
          break;
        }
      }

      // add to filtered array if is distinct
      if (is_distinct === true) {
        result.push(m);
      }
    }


    return result;
  };

  return API;
}
