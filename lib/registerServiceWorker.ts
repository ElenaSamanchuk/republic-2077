export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL;
    const swUrl = `${base}sw.js`.replace(/\/+/g, '/').replace(':/', '://');

    navigator.serviceWorker.register(swUrl).catch(() => {
      /* offline optional */
    });
  });
}
