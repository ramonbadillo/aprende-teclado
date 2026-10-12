'use strict';
window.ColoringSearch = (() => {
  const $ = id => document.getElementById(id);
  const api = 'https://api.openverse.org/v1/images/';
  const pageSize = 12, cacheLimit = 16, timeoutMs = 20000;
  const cache = new Map();
  let initialized = false, active = false, onSelect = null;
  let controller = null, revision = 0, busy = false, lastSearch = null;
  let form, queryInput, kindInput, results, message, more, submit, googleLink, googleInput;

  function updateGoogleLink() {
    const query = googleInput.value.trim().replace(/\s+/g, ' ').slice(0, 80);
    const params = new URLSearchParams({ udm: '2', safe: 'active', hl: 'es' });
    if (query) params.set('q', query);
    googleLink.href = `https://www.google.com/search?${params}`;
    return query;
  }

  function status(text, error = false) {
    message.textContent = text;
    message.dataset.error = String(error);
  }

  function updateControls() {
    results.setAttribute('aria-busy', String(busy));
    more.disabled = busy;
    // A new submission can replace a slow search without waiting for it.
    submit.setAttribute('aria-busy', String(busy));
    more.hidden = !lastSearch || lastSearch.page >= lastSearch.pageCount;
  }

  function stop() {
    revision++;
    if (controller) controller.abort();
    controller = null;
    busy = false;
  }

  function httpsLink(value) {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }

  function normalize(item) {
    if (!item || typeof item.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)) return null;
    if (item.mature === true || (Array.isArray(item.unstable__sensitivity) && item.unstable__sensitivity.length)) return null;
    if (!['cc0', 'pdm'].includes(item.license)) return null;
    // Only the provider's documented image endpoint may load remote pixels.
    // Do not use original URLs: their hosts may prevent browser processing.
    const thumbnail = `${api}${item.id}/thumb/`;
    if (item.thumbnail !== thumbnail) return null;
    return {
      id: item.id,
      title: typeof item.title === 'string' && item.title.trim() ? item.title.trim().slice(0, 180) : 'Dibujo sin título',
      creator: typeof item.creator === 'string' ? item.creator.slice(0, 180) : '',
      license: item.license === 'cc0' ? 'CC0' : 'Dominio público',
      sourceUrl: httpsLink(item.foreign_landing_url),
      licenseUrl: item.license === 'cc0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/publicdomain/mark/1.0/',
      thumbnail,
      url: `${thumbnail}?full_size=true`
    };
  }

  function link(label, url) {
    const anchor = document.createElement('a');
    anchor.textContent = label;
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    return anchor;
  }

  function card(item) {
    const article = document.createElement('article');
    article.className = 'coloring-search-card';
    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'coloring-search-pick';
    pick.setAttribute('aria-label', `Colorear ${item.title}`);
    pick.disabled = true;
    const img = document.createElement('img');
    img.className = 'coloring-search-image';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    const pickText = document.createElement('span');
    pickText.textContent = 'Cargando…';
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) { img.onerror(); return; }
      pick.disabled = false;
      pickText.textContent = 'Colorear';
    };
    img.onerror = () => {
      pick.disabled = true;
      img.hidden = true;
      pickText.textContent = 'Imagen no disponible';
      article.hidden = true;
      if (article.isConnected && active && Array.from(results.children).every(result => result.hidden)) {
        status('Estas imágenes ya no están disponibles. Prueba «Ver más imágenes» o busca con otras palabras.');
      }
    };
    pick.append(img, pickText);
    pick.addEventListener('click', async () => {
      if (!active || pick.disabled) return;
      try { await onSelect({ url: item.url, title: item.title, creator: item.creator, license: item.license, sourceUrl: item.sourceUrl, licenseUrl: item.licenseUrl }); }
      catch { if (active) status('No pudimos abrir ese dibujo. Elige otra imagen.', true); }
    });
    const meta = document.createElement('div');
    meta.className = 'coloring-search-meta';
    const title = document.createElement('p');
    title.className = 'coloring-search-title';
    title.textContent = item.title;
    title.title = item.title;
    meta.append(title);
    if (item.sourceUrl) meta.append(link('Fuente', item.sourceUrl), document.createTextNode(' · '));
    meta.append(link(item.license, item.licenseUrl));
    article.append(pick, meta);
    img.src = item.thumbnail;
    return article;
  }

  function remember(key, value) {
    cache.delete(key);
    cache.set(key, value);
    while (cache.size > cacheLimit) cache.delete(cache.keys().next().value);
  }

  async function search(query, kind, page = 1) {
    if (!active) return;
    query = query.trim().replace(/\s+/g, ' ').slice(0, 100);
    if (!query) { queryInput.focus(); status('Escribe qué te gustaría colorear.'); return; }
    stop();
    const version = revision;
    const requestController = new AbortController();
    controller = requestController;
    let timedOut = false;
    busy = true;
    if (page === 1) { results.replaceChildren(); lastSearch = null; }
    status(`Buscando «${query}»…`);
    updateControls();
    const key = JSON.stringify([query.toLocaleLowerCase(), kind, page]);
    const timer = setTimeout(() => { timedOut = true; requestController.abort(); }, timeoutMs);
    try {
      let data = cache.get(key);
      if (!data) {
        const params = new URLSearchParams({ q: query, page: String(page), page_size: String(pageSize), mature: 'false', license: 'cc0,pdm' });
        if (kind === 'illustration') params.set('category', 'illustration');
        const response = await fetch(`${api}?${params}`, { signal: requestController.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
        if (!response.ok) {
          const error = new Error(response.status === 429 ? 'rate' : 'network');
          throw error;
        }
        const raw = await response.json();
        if (!Array.isArray(raw.results)) throw new Error('network');
        data = { items: raw.results.slice(0, pageSize).map(normalize).filter(Boolean), pageCount: Number.isInteger(raw.page_count) ? Math.min(20, Math.max(page, raw.page_count)) : page };
        remember(key, data);
      }
      if (version !== revision || !active) return;
      const firstNewCard = results.childElementCount;
      for (const item of data.items) results.append(card(item));
      lastSearch = { query, kind, page, pageCount: data.pageCount };
      if (!results.childElementCount) status('No encontramos dibujos con esas palabras. Prueba otro nombre o elige «Dibujos y fotos».');
      else if (!data.items.length) status('No hay más imágenes disponibles en esta página. Puedes intentar con otros resultados.');
      else status(`Imágenes para «${query}». Elige una para crear tu hoja.`);
      if (page > 1 && data.items.length) results.children[firstNewCard].querySelector('button').focus({ preventScroll: true });
    } catch (error) {
      if (version !== revision || !active) return;
      status(error.message === 'rate' ? 'Llegamos al límite de búsquedas por ahora. Espera un poco e intenta de nuevo; también puedes subir una imagen.' : timedOut ? 'La búsqueda tardó demasiado. Intenta de nuevo en un momento.' : 'No pudimos conectarnos al buscador. Revisa tu conexión e intenta de nuevo.', true);
    } finally {
      clearTimeout(timer);
      if (version === revision) {
        controller = null;
        busy = false;
        if (active) updateControls();
      }
    }
  }

  return {
    init(options) {
      if (initialized) return;
      onSelect = options.onSelect;
      form = $('coloring-search-form');
      queryInput = $('coloring-search-query');
      kindInput = $('coloring-search-kind');
      results = $('coloring-search-results');
      message = $('coloring-search-status');
      more = $('coloring-search-more');
      submit = form.querySelector('[type="submit"]');
      googleLink = $('coloring-google-search');
      googleInput = $('coloring-google-query');
      googleInput.addEventListener('input', updateGoogleLink);
      googleLink.addEventListener('click', event => {
        if (!updateGoogleLink()) {
          event.preventDefault(); googleInput.focus(); $('coloring-google-status').textContent = 'Escribe qué te gustaría buscar en Google Imágenes.';
        } else $('coloring-google-status').textContent = 'Google se abre en otra pestaña. Copia una imagen y vuelve aquí para pegarla.';
      });
      $('coloring-google-form').addEventListener('submit', event => { event.preventDefault(); googleLink.click(); });
      form.addEventListener('submit', event => { event.preventDefault(); search(queryInput.value, kindInput.value); });
      more.addEventListener('click', () => { if (lastSearch && !busy) search(lastSearch.query, lastSearch.kind, lastSearch.page + 1); });
      form.parentElement.querySelectorAll('[data-coloring-query]').forEach(button => {
        button.addEventListener('click', () => { queryInput.value = button.dataset.coloringQuery; search(queryInput.value, kindInput.value); });
      });
      initialized = true;
      updateGoogleLink();
      updateControls();
    },
    enter() { active = true; if (initialized) updateControls(); },
    leave() {
      active = false;
      const wasBusy = busy;
      stop();
      if (initialized) {
        updateControls();
        if (wasBusy) status('Búsqueda detenida. Puedes buscar de nuevo cuando quieras.');
      }
    }
  };
})();
