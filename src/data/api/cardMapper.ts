import type { Word } from '../../domain/vocabulary';

export interface ApiCard {
  word: string;
  pronunciation: string;
  meanings: { definition: string; examples: string[] }[];
}

function stableId(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function fromApiCard(value: unknown): Word {
  const card = value as ApiCard | null;
  if (!card || typeof card.word !== 'string' || !card.word.trim() || typeof card.pronunciation !== 'string' ||
    !Array.isArray(card.meanings) || !card.meanings.length || card.meanings.some(meaning =>
      !meaning || typeof meaning.definition !== 'string' || !Array.isArray(meaning.examples) ||
      meaning.examples.some(example => typeof example !== 'string') || meaning.examples.length > 3)) {
    throw new Error('The API returned an invalid vocabulary card.');
  }
  const duplicates = new Map<string, number>();
  return {
    id: card.word, text: card.word,
    meanings: card.meanings.map(meaning => {
      const key = stableId(JSON.stringify([meaning.definition, meaning.examples]));
      const occurrence = duplicates.get(key) ?? 0;
      duplicates.set(key, occurrence + 1);
      return { id: `${key}-${occurrence}`, pronunciation: card.pronunciation,
        definition: meaning.definition, examples: meaning.examples, translation: '' };
    }),
  };
}

export function toApiCard(word: Word): ApiCard {
  return { word: word.text, pronunciation: word.meanings[0]?.pronunciation ?? '',
    meanings: word.meanings.map(({ definition, examples }) => ({ definition, examples })) };
}
