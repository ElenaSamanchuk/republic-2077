import type { CharacterId } from '../constants/characters';
import { CHARACTERS } from '../constants/characters';
import { PORTRAIT_URLS } from '../constants/gameAssets';

interface CharacterPortraitProps {
  character: CharacterId;
  className?: string;
}

export default function CharacterPortrait({ character, className = '' }: CharacterPortraitProps) {
  const profile = CHARACTERS[character];
  const src = PORTRAIT_URLS[character];

  return (
    <div className={`character-portrait-card ${className}`}>
      <img
        src={src}
        alt=""
        className="character-portrait-img"
        draggable={false}
        loading="eager"
        decoding="async"
      />
      <span className="sr-only">{profile.title}</span>
    </div>
  );
}

export function CharacterCaption({ character }: { character: CharacterId }) {
  const profile = CHARACTERS[character];
  return <p className="character-caption">{profile.title}</p>;
}
