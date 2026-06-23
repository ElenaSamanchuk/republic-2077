import { useEffect, useState } from 'react';
import LapseGame from './components/LapseGame';
import Onboarding, { hasCompletedOnboarding } from './components/Onboarding';
import DesktopLanding from './components/DesktopLanding';
import {
  hasSkippedDesktopLanding,
  markDesktopLandingSkipped,
  useDesktopLanding,
} from './lib/useDesktopLanding';
import './styles/globals.css';
import './styles/landing.css';

export default function App() {
  const [ready, setReady] = useState(false);
  const isDesktop = useDesktopLanding();
  const [showLanding, setShowLanding] = useState(
    () => isDesktop && !hasSkippedDesktopLanding(),
  );
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding());

  useEffect(() => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    window.addEventListener('resize', handleResize);
    setReady(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) setShowLanding(false);
  }, [isDesktop]);

  const startPlay = () => {
    markDesktopLandingSkipped();
    setShowLanding(false);
  };

  if (!ready) return null;

  if (showLanding) {
    return (
      <div className="w-full min-h-[100dvh] overflow-x-hidden bg-[var(--lapse-bar)] no-select">
        <DesktopLanding onPlay={startPlay} />
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[var(--background)] text-[var(--foreground)] no-select">
      {showOnboarding ? (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      ) : (
        <LapseGame />
      )}
    </div>
  );
}
