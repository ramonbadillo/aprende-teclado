// Run with: node tests/coloring-filters.test.cjs (no dependencies).
const assert = require('node:assert/strict');
require('../coloring/filters.js');
const { convert } = globalThis.ColoringFilters;

function fixture(width, height, paint) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data.set(paint(x, y), (y * width + x) * 4);
  }
  return { width, height, data };
}
function blackCount(pixels) {
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    assert.equal(pixels[i + 3], 255, 'Every output pixel is opaque');
    assert.equal(pixels[i + 1], pixels[i], 'The result contains no color');
    assert.equal(pixels[i + 2], pixels[i]);
    assert(pixels[i] === 0 || pixels[i] === 255, 'The result is black and white');
    count += pixels[i] === 0;
  }
  return count;
}

for (const fill of [[255, 255, 255, 255], [25, 40, 90, 255], [0, 0, 0, 0]]) {
  const blank = fixture(40, 40, () => fill);
  assert.equal(blackCount(convert(blank)), 0, 'Uniform colors and transparency produce blank paper');
}

// These colors have approximately the same perceived luminance: a grayscale-only
// Sobel filter would miss the boundary that a coloring page needs to preserve.
const colors = fixture(60, 40, x => x < 30 ? [255, 0, 0, 255] : [0, 76, 0, 255]);
const original = colors.data.slice();
const thin = convert(colors, { detail: 50, smoothing: 1, thickness: 1 });
const thinCount = blackCount(thin);
assert(thinCount >= 36 && thinCount <= 80, 'A strong color boundary becomes a thin continuous line');
for (let y = 2; y < colors.height - 2; y++) {
  assert([28, 29, 30, 31].some(x => thin[(y * colors.width + x) * 4] === 0), 'Every row has the color contour');
}
assert.deepEqual(colors.data, original, 'Converting does not mutate the source image');
const medium = convert(colors, { detail: 50, smoothing: 1, thickness: 2 });
const thick = convert(colors, { detail: 50, smoothing: 1, thickness: 3 });
assert(blackCount(medium) > thinCount, 'Medium lines are thicker than thin lines');
assert(blackCount(thick) > blackCount(medium), 'Thick lines are thicker than medium lines');
for (let i = 0; i < thin.length; i += 4) {
  if (thin[i] === 0) assert.equal(thick[i], 0, 'Thickening preserves the detected contour');
}

const rectangle = fixture(60, 60, (x, y) => x >= 14 && x < 46 && y >= 14 && y < 46 ? [70, 125, 230, 255] : [255, 255, 255, 255]);
const outline = convert(rectangle, { detail: 55, smoothing: 1, thickness: 1 });
assert(blackCount(outline) > 100, 'A colored region produces an outline');
assert.equal(outline[(30 * 60 + 30) * 4], 255, 'The filled center is cleared for coloring');
// A closed contour should keep a four-neighbor flood fill inside the rectangle.
const seen = new Set([30 * 60 + 30]);
const pending = [...seen];
while (pending.length) {
  const i = pending.pop();
  const x = i % 60;
  const y = Math.floor(i / 60);
  assert(x > 0 && x < 59 && y > 0 && y < 59, 'The rectangle contour is closed');
  for (const n of [i - 1, i + 1, i - 60, i + 60]) {
    if (!seen.has(n) && outline[n * 4] === 255) { seen.add(n); pending.push(n); }
  }
}

const subtle = fixture(50, 40, x => x < 25 ? [255, 255, 255, 255] : [231, 231, 231, 255]);
assert.equal(blackCount(convert(subtle, { detail: 0, smoothing: 0 })), 0, 'Low detail omits faint boundaries');
assert(blackCount(convert(subtle, { detail: 100, smoothing: 0 })) > 30, 'High detail includes faint boundaries');
const hiddenColor = fixture(40, 40, (x, y) => [x % 2 ? 255 : 0, y % 2 ? 255 : 0, 0, 0]);
assert.equal(blackCount(convert(hiddenColor)), 0, 'Invisible RGB values cannot create contours');
const penStroke = fixture(60, 60, x => x >= 27 && x < 32 ? [45, 55, 50, 255] : [240, 220, 180, 255]);
const penOutline = convert(penStroke, { thickness: 1 });
assert.equal(penOutline[(30 * 60 + 29) * 4], 0, 'Existing narrow dark strokes remain solid instead of becoming hollow rails');
const darkFill = fixture(60, 60, (x, y) => x >= 10 && x < 50 && y >= 10 && y < 50 ? [20, 20, 20, 255] : [255, 255, 255, 255]);
const darkOutline = convert(darkFill, { thickness: 1 });
assert(blackCount(darkOutline) > 100, 'A solid dark shape still has an outline');
for (let y = 17; y < 43; y++) {
  for (let x = 17; x < 43; x++) assert.equal(darkOutline[(y * 60 + x) * 4], 255, 'Broad dark fills are cleared for coloring');
}
assert.equal(blackCount(convert(fixture(1, 1, () => [0, 0, 0, 255]))), 0, 'Tiny images are handled');
assert.throws(() => convert({ width: 10, height: 10, data: new Uint8ClampedArray(4) }), TypeError);
console.log('Coloring filters: blank images, alpha, RGB contours, closed regions, detail, thickness and source preservation passed.');
