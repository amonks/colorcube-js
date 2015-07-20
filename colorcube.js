/*
Copyright (c) 2015, Ole Krause-Sparmann
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
PERFORMANCE OF THIS SOFTWARE. */


// Local maxima as found during the image analysis.
// We need this class for ordering by cell hit count.
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

// The color cube is made out of these cells
function CubeCell() {
  var API = {};

  // Count of hits
  // (dividing the accumulators by this value gives the average color)
  API.hit_count = 0;

  // accumulators for color components
  API.r_acc = 0.0;
  API.g_acc = 0.0;
  API.b_acc = 0.0;
}

// Uses a 3d RGB histogram to find local maximas in the density distribution
// in order to retrieve dominant colors of pixel images
function ColorCube(resolution, avoid_color) {
  var API = {};

  // __init__ block
  // (constructor)

    // keep resolution
    API.resolution = resolution;

    // threshold for distinct local maxima
    API.distinct_threshold = 0.2;

    // color to avoid
    API.avoid_color = avoid_color;

    // colors that are darker than this go away
    API.bright_threshold = 0.6;

    // helper variable to have cell count handy
    API.cell_count = resolution * resolution * resolution;

    // create cells
    API.cells = [];
    times(cell_count, function() {
      API.cells.push( CubeCell() );
    });
    // from underscore
    function times(n, iterator) {
      var accum = Array(Math.max(0, n));
      for (var i = 0; i < n; i++) accum[i] = iterator.call();
      return accum;
    }

    // indices for neighbor cells in three dimensional grid
    API.neighbour_indices = [
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
  API.cell_index = function(r, g, b) {
    return (r + g*API.resolution + b*API.resolution*API.resolution);
  };

  API.clear_cells = function() {
    for (var cell in API.cells) {
      cell.hit_count = 0;
      cell.r_acc = 0;
      cell.g_acc = 0;
      cell.b_acc = 0;
    }
  };

  API.get_colors = function(image) {
    m = API.find_local_maxima(image);

    if (typeof API.avoid_color !== 'undefined') {
      m = API.filter_too_similar(m);
    }

    m = API.filter_distinct_maxima(m);

    var colors = [];
    for (var n in m) {
      var r = int(n.r * 255.0);
      var g = int(n.g * 255.0);
      var b = int(n.b * 255.0);
      colors.append([r, g, b]);
    }

    return colors;
  };

  // finds and returns local maxima in 3d histogram, sorted by hit count
  API.find_local_maxima = function(self, image) {
    // reset all cells
    self.clear_cells();

    // iterate over all pixels of the image
    // TODO
    for (var pixels in image) {
      // get color components

      // stop if brightnesses are all below threshold

      // if image has alpha channel, weigh colors by it

      // map color components to cell indicies in each color dimension

      // compute linear cell index

      // increase hit count of cell

      // add pixel colors to cell color accumulators
    }

    // we collect local maxima in here
    var local_maxima = [];

    // find local maxima in the grid
    for (var r in API.resolution) {
      for (var g in API.resolution) {
        for (var b in API.resolution) {
          local_index = self.cell_index(r, g, b);

          // get hit count of this cell
          local_hit_count = self.cells[local_index].hit_count;

          // if this cell has no hits, ignore it
          if (local_hit_count === 0) {
            // TODO: continue/break/stop/whatever
          }

          // it's a local maxima until we find a neighbor with a higher hit count
          var is_local_maximum = true;

          // check if any neighbor has a higher hit count, if so, no local maxima
          for (var n in Array(27)) {
            r_index = r + self.neighbor_indices[n][0];
            g_index = g + self.neighbor_indices[n][1];
            b_index = b + self.neighbor_indices[n][2];

            // only check valid cell indices
            if (r_index >= 0 && g_index >= 0 && b_index >= 0) {
              if (r_index < self.resolution && g_index < self.resolution && b_index < self.resolution) {
                if (self.cells[self.cell_index(r_index, g_index, b_index)].hit_count > local_hit_count) {
                  // this is not a local maximum
                  is_local_maximum = false;
                  // TODO
                  break;
                }
              }
            }
          }

          // if this is not a local maximum, continue with loop
          if (is_local_maximum === false) {
            // TODO
            continue;
          }

          // otherwise add this cell as a local maximum
          var avg_r = self.cells[local_index].r_acc / float(self.cells[local_index].hit_count);
          var avg_g = self.cells[local_index].g_acc / float(self.cells[local_index].hit_count);
          var avg_b = self.cells[local_index].b_acc / float(self.cells[local_index].hit_count);
          local_maxima.append( LocalMaximum(local_hit_count, local_index, avg_r, avg_g, avg_b) );
        }
      }
    }

    // return local maxima sorted with respect to hit count
    // TODO
    return local_maxima;
  };

  // Returns a filtered version of the specified array of maxima,
  // in which all entries have a minimum distance of self.distinct_threshold
  API.filter_distinct_maxima = function(self, maxima) {
    // TODO
    return maxima;
  };


  // Returns a filtered version of the specified array of maxima,
  // in which all entries are far enough away from the specified avoid_color
  API.filter_too_similar = function(self, maxima) {
    // TODO
    return maxima;
  };
}
