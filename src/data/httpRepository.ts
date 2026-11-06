import type { VocabularyRepository, Word, SearchResults } from '../domain/vocabulary';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const endpoints = {
  library: '/library/words',
  word: (id: string) => `/words/${encodeURIComponent(id)}`,
  search: '/words/search',
  savedWord: (id: string) => `/library/words/${encodeURIComponent(id)}`,
  meaning: (wordId: string, meaningId: string) =>
    `/library/words/${encodeURIComponent(wordId)}/meanings/${encodeURIComponent(meaningId)}`,
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `The request failed (${response.status}). Please try again.`);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const httpRepository: VocabularyRepository = {
  listWords: (query = '', signal) => request<Word[]>(`${endpoints.library}?q=${encodeURIComponent(query)}`, { signal }),
  getWord: (id, signal) => request<Word>(endpoints.word(id), { signal }),
  searchWords: (query, signal) => request<SearchResults>(`${endpoints.search}?q=${encodeURIComponent(query)}`, { signal }),
  addWord: (wordId, meaningIds) => request<Word>(endpoints.library, {
    method: 'POST', body: JSON.stringify({ wordId, meaningIds }),
  }),
  deleteWord: id => request<void>(endpoints.savedWord(id), { method: 'DELETE' }),
  deleteMeaning: (wordId, meaningId) => request<Word>(endpoints.meaning(wordId, meaningId), { method: 'DELETE' }),
};
