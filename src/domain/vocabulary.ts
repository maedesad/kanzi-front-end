export interface Meaning {
  id: string;
  pronunciation: string;
  definition: string;
  translation: string;
  examples: string[];
}

export interface Word {
  id: string;
  text: string;
  meanings: Meaning[];
}

export interface SearchResults {
  match: Word[];
  suggested: Word[];
}

export interface VocabularyRepository {
  capabilities: { deleteWords: boolean; deleteMeanings: boolean; translations: boolean; suggestions: boolean };
  listWords(query?: string, signal?: AbortSignal): Promise<Word[]>;
  getWord(id: string, signal?: AbortSignal): Promise<Word>;
  searchWords(query: string, signal?: AbortSignal): Promise<SearchResults>;
  addWord(id: string, meaningIds: string[]): Promise<Word>;
  deleteWord(id: string): Promise<void>;
  deleteMeaning(wordId: string, meaningId: string): Promise<Word>;
}

export function normalizeQuery(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک').replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u200c\u200d]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function matchesWord(word: Word, query: string): boolean {
  const needle = normalizeQuery(query);
  return [word.text, ...word.meanings.map(meaning => meaning.translation)]
    .some(value => normalizeQuery(value).includes(needle));
}
