import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 900px) and (pointer: fine)';

export function useDesktopLanding(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export function hasSkippedDesktopLanding(): boolean {
  try {
    return sessionStorage.getItem('republic2077-play') === '1';
  } catch {
    return false;
  }
}

export function markDesktopLandingSkipped(): void {
  try {
    sessionStorage.setItem('republic2077-play', '1');
  } catch {
    /* ignore */
  }
}
