// Apply the saved theme before painting so returning visitors see no light flash.
(() => {
  const key = 'fabi-theme-v1';
  const root = document.documentElement;
  let preference;
  try { preference = localStorage.getItem(key); } catch { /* Storage is optional. */ }
  if (!['light', 'dark'].includes(preference)) preference = null;

  function apply(theme) {
    const dark = theme === 'dark';
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#10182e' : '#a9cfe6';
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      document.getElementById('theme-icon').textContent = dark ? '☀' : '☾';
      button.querySelector('.theme-label').textContent = dark ? 'Modo claro' : 'Modo oscuro';
    }
  }

  apply(preference || 'light');
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.getElementById('theme-toggle').addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem(key, preference); } catch { /* Keep working without storage. */ }
    });
  });
})();
