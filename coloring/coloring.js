'use strict';
window.ColoringTool = (() => {
  const $ = id => document.getElementById(id);
  const source = $('coloring-source'), output = $('coloring-output');
  const maxSide = 1400, maxBytes = 20 * 1024 * 1024;
  let active = false, pixels = null, ready = false, busy = false, loading = false;
  let dirty = false, renderTimer = null, loadVersion = 0, imageName = 'mi-dibujo';

  function status(message, error = false) {
    $('coloring-status').textContent = message;
    $('coloring-status').dataset.error = String(error);
  }
  function updateControls() {
    $('coloring-controls').disabled = !pixels || loading;
    $('coloring-download').disabled = !ready || busy || dirty;
    $('coloring-print').disabled = !ready || busy || dirty;
    $('coloring-clear').disabled = !pixels && !loading;
    $('coloring-previews').setAttribute('aria-busy', String(busy));
  }
  function settings() {
    return { detail: Number($('coloring-detail').value), smoothing: Number($('coloring-smoothing').value), thickness: Number($('coloring-thickness').value) };
  }
  function render() {
    renderTimer = null;
    if (!pixels || !active || loading) return;
    try {
      const data = window.ColoringFilters.convert(pixels, settings());
      output.width = pixels.width; output.height = pixels.height;
      output.getContext('2d').putImageData(new ImageData(data, pixels.width, pixels.height), 0, 0);
      output.hidden = false;
      $('coloring-output-empty').hidden = true;
      ready = true; dirty = false;
      let ink = false;
      for (let i = 0; i < data.length; i += 4) { if (data[i] < 128) { ink = true; break; } }
      status(ink ? '¡Tu hoja está lista! Ajusta los trazos o prepárate para colorear.' : 'No encontramos contornos. Prueba más detalles o una imagen con colores más definidos.');
    } catch {
      ready = false;
      output.hidden = true; $('coloring-output-empty').hidden = false;
      status('No pudimos crear los contornos. Prueba con una imagen más pequeña.', true);
    } finally { busy = false; updateControls(); }
  }
  function scheduleRender() {
    clearTimeout(renderTimer); dirty = true;
    if (!active || loading || !pixels) return;
    busy = true; updateControls(); status('Preparando los contornos…');
    // Give the browser a chance to paint the busy state; debounce slider changes.
    renderTimer = setTimeout(render, 120);
  }
  function acceptCanvas(canvas, name) {
    const ratio = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
    source.width = Math.max(1, Math.round(canvas.width * ratio));
    source.height = Math.max(1, Math.round(canvas.height * ratio));
    const context = source.getContext('2d', { willReadFrequently: true });
    context.fillStyle = '#fff'; context.fillRect(0, 0, source.width, source.height);
    context.drawImage(canvas, 0, 0, source.width, source.height);
    pixels = context.getImageData(0, 0, source.width, source.height);
    imageName = name.replace(/\.[^.]+$/, '') || 'mi-dibujo';
    $('coloring-filename').textContent = name;
    $('coloring-filename').title = name;
    $('coloring-size').textContent = `${source.width} × ${source.height} px`;
    source.hidden = false; output.hidden = true;
    $('coloring-source-empty').hidden = true; $('coloring-output-empty').hidden = false;
    loading = false; busy = false; ready = false;
    updateControls(); scheduleRender();
  }
  async function loadFile(file) {
    if (!file) return;
    const version = ++loadVersion;
    clearTimeout(renderTimer); loading = false; busy = false; updateControls();
    function fail(message) {
      loading = false; busy = false;
      // Finish a pending edit to the previous image if the replacement is invalid.
      if (dirty && pixels && active) render();
      updateControls(); status(message, true);
    }
    if (!(file.type ? /^image\/(png|jpeg|webp)$/.test(file.type) : /\.(png|jpe?g|webp)$/i.test(file.name))) {
      fail('Elige una imagen JPG, PNG o WebP.'); return;
    }
    if (!file.size || file.size > maxBytes) { fail('Elige una imagen de hasta 20 MB que no esté vacía.'); return; }
    let url;
    loading = true; busy = true; updateControls(); status('Abriendo tu imagen en este dispositivo…');
    try {
      url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
      if (version !== loadVersion) return;
      if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 40000000) throw new Error('size');
      const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      acceptCanvas(canvas, file.name);
    } catch (error) {
      if (version !== loadVersion) return;
      fail(error?.message === 'size' ? 'Esta imagen es demasiado grande. Prueba una de menos de 40 megapíxeles.' : 'No pudimos abrir esa imagen. Prueba otro archivo JPG, PNG o WebP.');
    } finally { if (url) URL.revokeObjectURL(url); }
  }
  function example() {
    ++loadVersion; clearTimeout(renderTimer);
    const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 760;
    const c = canvas.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, 1000, 760);
    c.lineWidth = 5; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = '#343e38';
    function shape(fill, draw) { c.beginPath(); draw(); c.fillStyle = fill; c.fill(); c.stroke(); }
    function ellipse(x, y, rx, ry, fill) { shape(fill, () => c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)); }
    function line(points) { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
    // The example is drawn locally too: no fetched image or generated asset.
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line([[795 + Math.cos(a) * 76, 140 + Math.sin(a) * 76], [795 + Math.cos(a) * 95, 140 + Math.sin(a) * 95]]); }
    ellipse(795, 140, 57, 57, '#f7ce66');
    ellipse(778, 135, 3, 5, '#343e38'); ellipse(812, 135, 3, 5, '#343e38');
    c.beginPath(); c.arc(795, 140, 22, .25, Math.PI - .25); c.stroke();
    shape('#d7edf4', () => { c.moveTo(142, 181); c.bezierCurveTo(105, 178, 105, 128, 148, 125); c.bezierCurveTo(145, 66, 227, 64, 240, 115); c.bezierCurveTo(293, 86, 336, 128, 320, 160); c.bezierCurveTo(365, 166, 349, 202, 317, 201); c.lineTo(142, 201); c.closePath(); });
    shape('#c6dfa1', () => { c.moveTo(80, 624); c.quadraticCurveTo(460, 536, 920, 625); c.lineTo(920, 690); c.lineTo(80, 690); c.closePath(); });
    shape('#f7d9a7', () => c.rect(325, 322, 335, 286));
    shape('#e89887', () => { c.moveTo(280, 333); c.lineTo(490, 156); c.lineTo(705, 333); c.closePath(); });
    shape('#b9d9d0', () => { c.moveTo(457, 608); c.lineTo(457, 459); c.bezierCurveTo(457, 403, 549, 403, 549, 459); c.lineTo(549, 608); c.closePath(); });
    ellipse(530, 512, 5, 5, '#f7ce66');
    shape('#b9dfea', () => c.rect(358, 370, 65, 72));
    shape('#b9dfea', () => c.rect(574, 370, 55, 72));
    line([[390, 370], [390, 442]]); line([[358, 406], [423, 406]]);
    line([[601, 370], [601, 442]]); line([[574, 406], [629, 406]]);
    function flower(x, y, color) {
      line([[x, y], [x, y + 156]]);
      shape('#9fc39a', () => { c.moveTo(x, y + 103); c.quadraticCurveTo(x - 70, y + 108, x - 52, y + 56); c.quadraticCurveTo(x - 10, y + 58, x, y + 103); });
      shape('#9fc39a', () => { c.moveTo(x, y + 127); c.quadraticCurveTo(x + 65, y + 121, x + 54, y + 78); c.quadraticCurveTo(x + 14, y + 83, x, y + 127); });
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ellipse(x + Math.cos(a) * 33, y + Math.sin(a) * 33, 26, 26, color); }
      ellipse(x, y, 24, 24, '#f8d574');
    }
    flower(195, 453, '#d6b8e1'); flower(800, 463, '#efa7ad');
    acceptCanvas(canvas, 'Mi jardín.png');
  }
  function defaults() {
    $('coloring-detail').value = '55'; $('coloring-detail-value').value = '55';
    $('coloring-smoothing').value = '1'; $('coloring-thickness').value = '2';
  }
  function clear() {
    ++loadVersion; clearTimeout(renderTimer);
    pixels = null; ready = busy = loading = dirty = false;
    source.width = source.height = output.width = output.height = 1;
    source.hidden = output.hidden = true;
    $('coloring-source-empty').hidden = $('coloring-output-empty').hidden = false;
    $('coloring-filename').textContent = 'El punto de partida'; $('coloring-filename').removeAttribute('title');
    $('coloring-size').textContent = 'Una nueva posibilidad'; $('coloring-file').value = '';
    defaults(); updateControls(); status('Tu imagen se queda en este dispositivo. No se sube a internet.');
    $('coloring-pick').focus({ preventScroll: true });
  }
  $('coloring-pick').addEventListener('click', () => $('coloring-file').click());
  $('coloring-file').addEventListener('change', event => { const file = event.target.files[0]; event.target.value = ''; loadFile(file); });
  $('coloring-example').addEventListener('click', example);
  $('coloring-detail').addEventListener('input', () => { $('coloring-detail-value').value = $('coloring-detail').value; scheduleRender(); });
  for (const id of ['coloring-smoothing', 'coloring-thickness']) $(id).addEventListener('change', scheduleRender);
  $('coloring-reset').addEventListener('click', () => { defaults(); scheduleRender(); });
  $('coloring-clear').addEventListener('click', clear);
  $('coloring-print').addEventListener('click', () => { if (ready && !busy && !dirty) window.print(); });
  $('coloring-download').addEventListener('click', () => {
    if (!ready || busy || dirty) return;
    const name = imageName.replace(/[^\p{L}\p{N}_ -]/gu, '').trim().slice(0, 70) || 'mi-dibujo';
    output.toBlob(blob => {
      if (!blob) { status('No pudimos descargar la imagen. Intenta de nuevo.', true); return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = `${name}-para-colorear.png`;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }, 'image/png');
  });
  const dropzone = $('coloring-dropzone');
  dropzone.addEventListener('dragover', event => {
    if (!active || !Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; dropzone.classList.add('is-dragging');
  });
  dropzone.addEventListener('dragleave', event => { if (!dropzone.contains(event.relatedTarget)) dropzone.classList.remove('is-dragging'); });
  dropzone.addEventListener('drop', event => {
    if (!active) return;
    event.preventDefault(); dropzone.classList.remove('is-dragging');
    if (event.dataTransfer.files.length !== 1) { status('Elige un solo dibujo a la vez.', true); return; }
    loadFile(event.dataTransfer.files[0]);
  });
  return {
    enter() { active = true; if (dirty && !loading) scheduleRender(); },
    leave() { active = false; clearTimeout(renderTimer); dropzone.classList.remove('is-dragging'); if (!loading) busy = false; updateControls(); }
  };
})();
