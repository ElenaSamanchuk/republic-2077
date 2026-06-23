/** Убирает точку в конце — как в Lapse */
export function formatNarrative(text: string): string {
  return text.replace(/\.\s*$/, '').trim();
}
