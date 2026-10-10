'use strict';

(() => {
  const url = new URL(window.location.href);

  // Folder URLs are served as index.html by the website host.
  if (['http:', 'https:'].includes(url.protocol) && url.pathname.endsWith('/index.html')) {
    url.pathname = url.pathname.slice(0, -'index.html'.length);
    window.history.replaceState(window.history.state, '', url.href);
  }

  // Local file previews need an explicit filename to avoid opening a directory.
  if (url.protocol === 'file:') {
    document.querySelectorAll('a[data-site-link]').forEach(link => {
      const target = new URL(link.getAttribute('href'), url);
      target.pathname += 'index.html';
      link.href = target.href;
    });
  }
})();
