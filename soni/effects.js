'use strict';
// Add new reactions here; keyboard handling, held state and audio stay independent.
Soni.createEffects = function (particles) {
  const symbols = ['✦', '⭐', '✧', '♡', '🎈', '🌈', '●', '◆', '🫧'];
  const between = (min, max) => min + Math.random() * (max - min);
  function burst({ x, color }, count, { direction, bubbles = false, stars = false } = {}) {
    const originX = Math.max(.08, Math.min(.92, x + between(-.08, .08)));
    const originY = between(.3, .82);
    for (let i = 0; i < count; i++) {
      const angle = between(0, Math.PI * 2), travel = between(55, 170);
      particles.add({ x: originX, y: stars ? between(.02, .18) : originY,
        symbol: bubbles ? '' : stars ? '⭐' : symbols[Math.floor(Math.random() * symbols.length)],
        color: i % 2 ? Soni.palette[Math.floor(Math.random() * Soni.palette.length)] : color,
        dx: direction ? direction[0] * travel + between(-20, 20) : Math.cos(angle) * travel,
        dy: stars ? between(140, 290) : direction ? direction[1] * travel + between(-20, 20) : Math.sin(angle) * travel - 65,
        size: bubbles ? between(13, 32) : between(23, 49), duration: between(1000, 2000), kind: bubbles ? 'bubble' : '' });
    }
    // A brief spark near the pressed key ties the stage to the keyboard below.
    particles.add({ x, y: .94, symbol: '✧', color, size: 24, dy: -38, duration: 600 });
  }
  const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  return {
    press(key, tier) {
      const count = [0, 4, 7, 12, 16][tier];
      if (key.code === 'Space') {
        particles.add({ x: -.1, y: between(.2, .55), symbol: '🌈', color: key.color, dx: 1300, dy: -20, size: 105, duration: 1800, kind: 'rainbow-wave' });
        burst(key, count);
      } else if (key.code === 'Enter' || key.code === 'NumpadEnter') {
        for (let i = 0; i < 3; i++) burst({ ...key, x: between(.08, .92) }, Math.ceil(count / 3) + 2, { stars: true });
      } else if (key.code === 'Backspace') burst(key, count + 9, { bubbles: true });
      else burst(key, count, { direction: directions[key.code] });
    },
    celebrate() {
      for (let i = 0; i < 36; i++) particles.add({ x: between(.06, .94), y: between(.15, .85),
        symbol: ['🎉', '🌈', '⭐', '✨', '🎈'][i % 5], color: Soni.palette[i % Soni.palette.length],
        dx: between(-110, 110), dy: between(-180, 60), size: between(30, 66), duration: between(1400, 2300) });
    }
  };
};
