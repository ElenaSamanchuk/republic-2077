# Republic 2077

Свайп-симулятор решений правителя республики (Lapse / Reigns style).

- **Игра:** [elenasamanchuk.github.io/republic-2077](https://elenasamanchuk.github.io/republic-2077/)
- **APK:** [последняя сборка](https://github.com/ElenaSamanchuk/republic-2077/releases/tag/apk-latest) — работает **офлайн** после установки

## Локально

```bash
npm install
npm run dev
```

## GitHub Pages

Push в `main` → workflow **Deploy GitHub Pages** (`base: /republic-2077/`).

## Android APK

Push в `main` → workflow **Build Android APK** → release `apk-latest`.

```bash
npm run build:android
npx cap add android   # один раз
npm run cap:sync
npm run cap:open:android
```

## Офлайн

- Шрифты bundled (`@fontsource/ibm-plex-mono`)
- Ассеты и звук — локально (Web Audio, без CDN)
- Android: Capacitor с `base: './'`
- PWA: service worker кэширует shell и ассеты

## Десктоп

На экранах ≥900px показывается лендинг (как у [Поток](https://elenasamanchuk.github.io/vital-coach/onboarding/)); «Играть в браузере» открывает игру.
