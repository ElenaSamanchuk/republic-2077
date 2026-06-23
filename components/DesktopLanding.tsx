import { PORTRAIT_URLS } from '../constants/gameAssets';

const APK_URL =
  'https://github.com/ElenaSamanchuk/republic-2077/releases/download/apk-latest/republic-2077.apk';

interface DesktopLandingProps {
  onPlay: () => void;
}

export default function DesktopLanding({ onPlay }: DesktopLandingProps) {
  return (
    <div className="desktop-landing">
      <div className="desktop-landing__grid">
        <section className="desktop-landing__copy">
          <div className="desktop-landing__brand">
            <span className="desktop-landing__glyph" aria-hidden>
              ★
            </span>
            <div>
              <h1 className="desktop-landing__title">Republic 2077</h1>
              <p className="desktop-landing__tagline">свайп-симулятор правителя</p>
            </div>
          </div>

          <p className="desktop-landing__lead">
            Держи баланс народа, казны, силы и доверия. Каждый свайп — решение с последствиями. Слишком
            низко или слишком высоко в любой сфере — правление закончится.
          </p>

          <ul className="desktop-landing__features">
            <li>Карточки советников и событий — только жест влево или вправо</li>
            <li>Четыре силы сверху: лист, человек, винтовка, монета</li>
            <li>Работает офлайн после установки на Android</li>
          </ul>

          <div className="desktop-landing__actions">
            <button type="button" className="desktop-landing__btn desktop-landing__btn--primary" onClick={onPlay}>
              Играть в браузере
            </button>
            <a
              className="desktop-landing__btn desktop-landing__btn--ghost"
              href={APK_URL}
              download="republic-2077.apk"
              rel="noopener noreferrer"
            >
              Скачать APK для Android
            </a>
          </div>

          <p className="desktop-landing__note">
            На телефоне игра открывается сразу. APK — release-сборка из GitHub Actions, интернет не нужен.
          </p>
        </section>

        <aside className="desktop-landing__device" aria-label="Превью игры">
          <div className="desktop-landing__phone">
            <div className="desktop-landing__phone-notch" aria-hidden />
            <div className="desktop-landing__phone-screen">
              <img
                src={PORTRAIT_URLS.citizen}
                alt=""
                className="desktop-landing__preview-portrait"
                draggable={false}
              />
              <p className="desktop-landing__preview-text">
                Народ вышел на площадь: «Покажите, что республика — не пустой лозунг»
              </p>
              <div className="desktop-landing__preview-stats" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
