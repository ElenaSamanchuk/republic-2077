import { useState } from 'react';
import CharacterPortrait from './CharacterPortrait';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'Republic 2077',
    body: 'Вы правите республикой. Свайпайте карточку влево или вправо — каждый жест меняет судьбу государства.',
    character: 'citizen' as const,
  },
  {
    title: 'Четыре силы',
    body: 'Сверху — лист, человек, винтовка, монета. Свайпайте не до конца, чтобы увидеть, что изменится.',
    character: 'general' as const,
  },
  {
    title: 'Готовы',
    body: 'Держите баланс. Слишком низко или слишком высоко в любой сфере — правление закончится.',
    character: 'oracle' as const,
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding fixed inset-0 z-50 flex flex-col items-center justify-center w-full max-w-[430px] mx-auto px-3 safe-top safe-bottom">
      <CharacterPortrait character={current.character} />
      <h1 className="mt-6 text-center">{current.title}</h1>
      <p className="mt-3 text-center max-w-sm">{current.body}</p>

      <div className="flex gap-2 mt-8">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`onboarding-dot ${i === step ? 'onboarding-dot--active' : ''}`}
          />
        ))}
      </div>

      <button
        type="button"
        className="onboarding-btn mt-8"
        onClick={() => {
          if (isLast) {
            try {
              localStorage.setItem('republic2077-onboarded', '1');
            } catch {
              /* ignore */
            }
            onComplete();
          } else {
            setStep((s) => s + 1);
          }
        }}
      >
        {isLast ? 'Начать' : 'Далее'}
      </button>
    </div>
  );
}

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem('republic2077-onboarded') === '1';
  } catch {
    return false;
  }
}
