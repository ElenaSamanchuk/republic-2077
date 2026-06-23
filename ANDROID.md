# Android (Capacitor)

## Требования

- Node 18+
- Android Studio с SDK 34+
- JDK 17

## Сборка

```bash
cd simulator
npm install
npm run build:android
npx cap add android   # один раз
npm run cap:sync
npm run cap:open:android
```

В Android Studio: **Run** на эмуляторе или устройстве.

## Заметки

- `build:android` ставит `base: './'` для локальных ассетов в APK.
- Для GitHub Pages используйте обычный `npm run build` (`base: /simulator/`).
- Иконки и splash: замените `android/app/src/main/res/` после `cap add android`.
- Safe area уже учтена через `env(safe-area-inset-*)` в CSS.

## Публикация

1. Сгенерируйте signed bundle в Android Studio.
2. Загрузите в Google Play Console.
3. Название в сторе: **Republic 2077** (подзаголовок: «решения правителя»).
