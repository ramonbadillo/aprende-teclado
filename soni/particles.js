'use strict';
Soni.createParticles = function (container) {
  const active = new Map();
  const MAX_PARTICLES = 120;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function remove(element) {
    clearTimeout(active.get(element)); active.delete(element); element.remove();
  }
  function add({ x, y, symbol = '✦', color, dx = 0, dy = -100, size = 36, duration = 1500, kind = '' }) {
    while (active.size >= MAX_PARTICLES) remove(active.keys().next().value);
    const element = document.createElement('span');
    element.className = `soni-particle ${kind}`; element.textContent = symbol;
    element.style.left = `${x * 100}%`; element.style.top = `${y * 100}%`;
    element.style.color = color; element.style.fontSize = `${size}px`;
    element.style.setProperty('--dx', `${dx}px`); element.style.setProperty('--dy', `${dy}px`);
    element.style.setProperty('--spin', `${Math.random() * 150 - 75}deg`);
    const lifetime = reducedMotion.matches ? 450 : duration;
    element.style.setProperty('--duration', `${lifetime}ms`);
    // Timeout also removes elements when animations are disabled or interrupted.
    active.set(element, setTimeout(() => remove(element), lifetime + 100));
    element.addEventListener('animationend', () => remove(element), { once: true });
    container.append(element);
  }
  return { add, clear() { for (const element of active.keys()) remove(element); } };
};
