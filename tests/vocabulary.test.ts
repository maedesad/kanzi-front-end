import { beforeEach, describe, expect, it, vi } from 'vitest';
import { matchesWord, normalizeQuery } from '../src/domain/vocabulary';
import { mockRepository } from '../src/data/mockRepository';
import { dictionary } from '../src/data/seed';

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
});

describe('bilingual vocabulary behavior', () => {
  it('normalizes Persian keyboard variants and case', () => {
    expect(normalizeQuery('  كنجكاوي  ')).toBe('کنجکاوی');
    expect(matchesWord(dictionary[1], 'كنجكاوي')).toBe(true);
    expect(matchesWord(dictionary[0], 'RESPONS')).toBe(true);
  });
  it('returns exact Persian matches separately from suggestions', async () => {
    const results = await mockRepository.searchWords('هدیه');
    expect(results.match.map(word => word.id)).toEqual(['present', 'gift']);
    expect(results.suggested.some(word => word.id === 'thoughtful')).toBe(true);
    expect((await mockRepository.searchWords('zzzz')).suggested).toEqual([]);
  });
  it('persists only the selected meanings and never restores removed ones on duplicate add', async () => {
    await mockRepository.addWord('present', ['gift', 'here']);
    await mockRepository.deleteMeaning('present', 'gift');
    await mockRepository.addWord('present', ['gift', 'here', 'offer']);
    expect((await mockRepository.getWord('present')).meanings.map(item => item.id)).toEqual(['here']);
    await expect(mockRepository.deleteMeaning('present', 'here')).rejects.toThrow('last meaning');
  });
  it('deletes a saved word without deleting the dictionary entry', async () => {
    await mockRepository.addWord('present', ['gift']);
    await mockRepository.deleteWord('present');
    expect((await mockRepository.listWords('present'))).toEqual([]);
    expect((await mockRepository.getWord('present')).meanings).toHaveLength(3);
  });
  it('does not save an empty card and cancels superseded searches', async () => {
    await expect(mockRepository.addWord('present', [])).rejects.toThrow('at least one');
    const controller = new AbortController();
    const search = mockRepository.searchWords('present', controller.signal);
    controller.abort();
    await expect(search).rejects.toMatchObject({ name: 'AbortError' });
  });
});
