import type { VocabularyRepository, Word } from '../domain/vocabulary';
import { matchesWord, normalizeQuery } from '../domain/vocabulary';
import { dictionary, initialLibrary } from './seed';

const storageKey = 'kanzi.library.v1';

function readLibrary(): Word[] {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return structuredClone(initialLibrary);
  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed) || parsed.some(word => !word?.id || !Array.isArray(word.meanings))) {
    throw new Error('Your saved library could not be read. Please check your browser storage.');
  }
  return parsed as Word[];
}

function saveLibrary(words: Word[]) {
  localStorage.setItem(storageKey, JSON.stringify(words));
}

async function delay(signal?: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, 120);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

export const mockRepository: VocabularyRepository = {
  async listWords(query = '', signal) {
    await delay(signal);
    return readLibrary().filter(word => matchesWord(word, query));
  },
  async getWord(id, signal) {
    await delay(signal);
    const word = readLibrary().find(item => item.id === id) ?? dictionary.find(item => item.id === id);
    if (!word) throw new Error('This word could not be found.');
    return structuredClone(word);
  },
  async searchWords(query, signal) {
    await delay(signal);
    const needle = normalizeQuery(query);
    if (!needle) return { match: [], suggested: [] };
    const match = dictionary.filter(word => normalizeQuery(word.text) === needle ||
      word.meanings.some(item => normalizeQuery(item.translation) === needle));
    const related: Record<string, string[]> = {
      present: ['gift', 'presence', 'thoughtful'], gift: ['present', 'thoughtful'],
      responsibility: ['mindful', 'resilience', 'opportunity'],
    };
    const relatedIds = match.flatMap(word => related[word.id] ?? []);
    const suggested = dictionary.filter(word => !match.includes(word) &&
      (matchesWord(word, needle) || relatedIds.includes(word.id)));
    return { match, suggested };
  },
  async addWord(id, meaningIds) {
    const library = readLibrary();
    const existing = library.find(word => word.id === id);
    if (existing) return existing;
    const source = dictionary.find(word => word.id === id);
    if (!source) throw new Error('This word could not be found.');
    const word = { ...source, meanings: source.meanings.filter(item => meaningIds.includes(item.id)) };
    if (!word.meanings.length) throw new Error('Keep at least one meaning before adding this word.');
    saveLibrary([...library, word]);
    return structuredClone(word);
  },
  async deleteWord(id) { saveLibrary(readLibrary().filter(word => word.id !== id)); },
  async deleteMeaning(wordId, meaningId) {
    const library = readLibrary();
    const word = library.find(item => item.id === wordId);
    if (!word) throw new Error('This word is no longer in your library.');
    const updated = { ...word, meanings: word.meanings.filter(item => item.id !== meaningId) };
    if (!updated.meanings.length) throw new Error('Use Delete word to remove the last meaning.');
    saveLibrary(library.map(item => item.id === wordId ? updated : item));
    return structuredClone(updated);
  },
};
