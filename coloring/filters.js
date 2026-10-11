/* Local image processing. This classic script also works when opened with file://. */
(function (root) {
  'use strict';

  function setting(value, fallback, min, max) {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  }

  // A separable [1, 2, 1] Gaussian. Replicated borders avoid a frame around the image.
  function soften(rgb, temporary, width, height) {
    for (var y = 0; y < height; y++) {
      var row = y * width * 3;
      for (var x = 0; x < width; x++) {
        var p = row + x * 3;
        var left = x ? p - 3 : p;
        var right = x + 1 < width ? p + 3 : p;
        for (var c = 0; c < 3; c++) {
          temporary[p + c] = (rgb[left + c] + 2 * rgb[p + c] + rgb[right + c]) * 0.25;
        }
      }
    }
    var stride = width * 3;
    for (var y = 0; y < height; y++) {
      var row = y * stride;
      for (var x = 0; x < width; x++) {
        var p = row + x * 3;
        var above = y ? p - stride : p;
        var below = y + 1 < height ? p + stride : p;
        for (var c = 0; c < 3; c++) {
          rgb[p + c] = (temporary[above + c] + 2 * temporary[p + c] + temporary[below + c]) * 0.25;
        }
      }
    }
  }

  // Keep existing pen strokes solid instead of tracing both sides of the ink.
  // Opposing bright samples distinguish narrow dark ridges from broad dark fills.
  var ridgeDirections = [[6, 0], [0, 6], [6, 6], [6, -6]];
  function isInkRidge(rgb, width, height, x, y) {
    var p = (y * width + x) * 3;
    var ink = Math.max(rgb[p], rgb[p + 1], rgb[p + 2]);
    if (ink > 116) return false;
    for (var d = 0; d < ridgeDirections.length; d++) {
      var dx = ridgeDirections[d][0];
      var dy = ridgeDirections[d][1];
      if (x - dx < 0 || x + dx >= width || y - dy < 0 || y - dy >= height || y + dy < 0 || y + dy >= height) continue;
      var before = ((y - dy) * width + x - dx) * 3;
      var after = ((y + dy) * width + x + dx) * 3;
      if (Math.max(rgb[before], rgb[before + 1], rgb[before + 2]) > ink + 48 &&
          Math.max(rgb[after], rgb[after + 1], rgb[after + 2]) > ink + 48) return true;
    }
    return false;
  }

  /**
   * Produce black contours on an opaque white background without changing the input.
   * detail: 0..100 (more includes weaker edges); smoothing: 0..3;
   * thickness: 1..3 (thin / medium / thick, approximately 1 / 3 / 5 pixels).
   * The caller should resize large images before passing ImageData (about 1400px).
   */
  function convert(imageData, options) {
    if (!imageData || !Number.isInteger(imageData.width) || !Number.isInteger(imageData.height) ||
        imageData.width < 1 || imageData.height < 1 || !imageData.data ||
        imageData.data.length !== imageData.width * imageData.height * 4) {
      throw new TypeError('Expected RGBA image data with positive integer dimensions.');
    }
    options = options || {};
    var detail = setting(options.detail, 55, 0, 100);
    var smoothing = Math.round(setting(options.smoothing, 1, 0, 3));
    var thickness = Math.round(setting(options.thickness, 1, 1, 3));
    var width = imageData.width;
    var height = imageData.height;
    var count = width * height;
    var output = new Uint8ClampedArray(count * 4);
    output.fill(255);
    if (width < 3 || height < 3) return output;

    var rgb = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var p = i * 4;
      var alpha = imageData.data[p + 3] / 255;
      for (var c = 0; c < 3; c++) {
        rgb[i * 3 + c] = 255 + (imageData.data[p + c] - 255) * alpha;
      }
    }
    if (smoothing) {
      var temporary = new Float32Array(rgb.length);
      for (var pass = 0; pass < smoothing * 2 - 1; pass++) soften(rgb, temporary, width, height);
    }

    var magnitude = new Float32Array(count);
    var direction = new Uint8Array(count);
    var stride = width * 3;
    for (var y = 1; y < height - 1; y++) {
      for (var x = 1; x < width - 1; x++) {
        var i = y * width + x;
        var p = i * 3;
        var strongest = 0;
        var edgeX = 0;
        var edgeY = 0;
        // Use the strongest RGB gradient: equal-luminance color boundaries survive.
        // Selecting its direction also avoids cancellation between opposite color changes.
        for (var c = 0; c < 3; c++) {
          var q = p + c;
          var gx = rgb[q - stride + 3] + 2 * rgb[q + 3] + rgb[q + stride + 3] -
            rgb[q - stride - 3] - 2 * rgb[q - 3] - rgb[q + stride - 3];
          var gy = rgb[q + stride - 3] + 2 * rgb[q + stride] + rgb[q + stride + 3] -
            rgb[q - stride - 3] - 2 * rgb[q - stride] - rgb[q - stride + 3];
          var strength = gx * gx + gy * gy;
          if (strength > strongest) {
            strongest = strength;
            edgeX = gx;
            edgeY = gy;
          }
        }
        magnitude[i] = Math.sqrt(strongest) * 0.25;
        var ax = Math.abs(edgeX);
        var ay = Math.abs(edgeY);
        if (ay <= ax * 0.41421356) direction[i] = 0;
        else if (ax <= ay * 0.41421356) direction[i] = 1;
        else direction[i] = edgeX * edgeY > 0 ? 2 : 3;
      }
    }

    var strongThreshold = 64 * Math.pow(0.125, detail / 100);
    var weakThreshold = strongThreshold * 0.4;
    var edges = new Uint8Array(count);
    var pending = new Uint32Array(count);
    var pendingCount = 0;
    var offsets = [1, width, width + 1, width - 1];
    // Thin the gradients before following weak edges connected to a strong contour.
    for (var y = 1; y < height - 1; y++) {
      for (var x = 1; x < width - 1; x++) {
        var i = y * width + x;
        var m = magnitude[i];
        var offset = offsets[direction[i]];
        if (m < weakThreshold || m < magnitude[i - offset] || m <= magnitude[i + offset]) continue;
        if (m >= strongThreshold) {
          edges[i] = 2;
          pending[pendingCount++] = i;
        } else edges[i] = 1;
      }
    }
    while (pendingCount) {
      var i = pending[--pendingCount];
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          var neighbor = i + dy * width + dx;
          if (edges[neighbor] === 1) {
            edges[neighbor] = 2;
            pending[pendingCount++] = neighbor;
          }
        }
      }
    }

    var radius = thickness - 1;
    for (var y = 1; y < height - 1; y++) {
      for (var x = 1; x < width - 1; x++) {
        if (edges[y * width + x] !== 2 && !isInkRidge(rgb, width, height, x, y)) continue;
        for (var dy = -radius; dy <= radius; dy++) {
          var yy = y + dy;
          if (yy < 0 || yy >= height) continue;
          for (var dx = -radius; dx <= radius; dx++) {
            var xx = x + dx;
            // Rounded tips for the thickest setting.
            if (xx < 0 || xx >= width || dx * dx + dy * dy > radius * radius + 1) continue;
            var p = (yy * width + xx) * 4;
            output[p] = output[p + 1] = output[p + 2] = 0;
          }
        }
      }
    }
    return output;
  }

  root.ColoringFilters = Object.freeze({ convert: convert });
})(typeof window !== 'undefined' ? window : globalThis);
