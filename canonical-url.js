'use strict';
(() => {
  const url = new URL(window.location.href);
  if (['http:', 'https:'].includes(url.protocol) && url.pathname.endsWith('/index.html')) {
    url.pathname = url.pathname.slice(0, -'index.html'.length);
    window.history.replaceState(window.history.state, '', url.href);
  }
})();
