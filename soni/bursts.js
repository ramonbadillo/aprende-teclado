'use strict';
// A rolling window counts new downs, never the browser's key auto-repeat.
Soni.createBurstDetector = function () {
  let times = [];
  let tier = 1;
  let celebratedAt = -Infinity;
  return {
    press(now = performance.now()) {
      times = times.filter(time => now - time < 250); times.push(now);
      const next = times.length >= 7 ? 4 : times.length >= 4 ? 3 : times.length >= 2 ? 2 : 1;
      const celebration = next === 4 && tier < 4 && now - celebratedAt >= 900;
      if (celebration) celebratedAt = now;
      tier = next;
      return { tier, celebration };
    },
    reset() { times = []; tier = 1; celebratedAt = -Infinity; }
  };
};
