'use strict';

(() => {
  const url = new URL(window.location.href);

  // Local file previews need an explicit filename to avoid opening a directory.
  if (url.protocol === 'file:') {
    document.querySelectorAll('a[data-site-link]').forEach(link => {
      const target = new URL(link.getAttribute('href'), url);
      if (target.pathname.endsWith('/')) target.pathname += 'index.html';
      link.href = target.href;
    });
  }
})();
