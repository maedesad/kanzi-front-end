import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHttpRepository } from '../src/data/httpRepository';
import { fromApiCard, toApiCard, type ApiCard } from '../src/data/api/cardMapper';

const card: ApiCard = { word: 'Present', pronunciation: '/ˈprez.ənt/', meanings: [
  { definition: 'A gift.', examples: ['She gave me a present.'] },
  { definition: 'Being here.', examples: ['Everyone was present.', 'She was present yesterday.'] },
] };
const fetchMock = vi.fn<typeof fetch>();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });
afterEach(() => vi.unstubAllGlobals());

describe('kanzi-api contract integration', () => {
  it('maps the real card schema without fabricating translations or a third example', () => {
    const mapped = fromApiCard(card);
    expect(mapped.id).toBe('Present');
    expect(mapped.meanings[0].translation).toBe('');
    expect(mapped.meanings[0].examples).toHaveLength(1);
    expect(toApiCard(mapped)).toEqual(card);
    expect(fromApiCard({ ...card, meanings: [card.meanings[1]] }).meanings[0].id).toBe(mapped.meanings[1].id);
    expect(() => fromApiCard({ word: 'Invalid' })).toThrow('invalid vocabulary card');
  });
  it('reads names and card details through the actual endpoints and filters locally', async () => {
    fetchMock.mockResolvedValueOnce(json(['Present', 'Present'])).mockResolvedValueOnce(json(card));
    const words = await createHttpRepository().listWords('PRES');
    expect(words.map(word => word.text)).toEqual(['Present']);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/cards', '/api/cards/Present']);
  });
  it('generates on explicit search, caches the draft and submits selected meaning content', async () => {
    const repository = createHttpRepository();
    fetchMock.mockResolvedValueOnce(json([])).mockResolvedValueOnce(json(card));
    const { match } = await repository.searchWords('Present');
    expect(fetchMock.mock.calls[1]).toEqual(['/api/cards/Present/generate', expect.objectContaining({ method: 'POST' })]);
    expect((await repository.getWord('Present')).meanings).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockResolvedValueOnce(json([])).mockResolvedValueOnce(json({ ...card, meanings: [card.meanings[1]] }, 201));
    const saved = await repository.addWord('Present', [match[0].meanings[1].id]);
    expect(saved.meanings).toHaveLength(1);
    const request = fetchMock.mock.calls[3][1]!;
    expect(JSON.parse(request.body as string)).toEqual({ ...card, meanings: [card.meanings[1]] });
    expect(request.headers).toEqual({ 'Content-Type': 'application/json' });
  });
  it('finds a saved word regardless of input case without generating or saving a duplicate', async () => {
    const repository = createHttpRepository();
    fetchMock.mockResolvedValueOnce(json(['Present'])).mockResolvedValueOnce(json(card));
    const result = await repository.searchWords('present');
    expect(result.match[0].id).toBe('Present');
    fetchMock.mockResolvedValueOnce(json(['Present'])).mockResolvedValueOnce(json(card));
    await repository.addWord('present', ['ignored']);
    expect(fetchMock.mock.calls.every(([, init]) => !init?.method)).toBe(true);
  });
  it('surfaces FastAPI validation errors and offline failures', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: [{ msg: 'Field required' }] }, 422));
    await expect(createHttpRepository().listWords()).rejects.toThrow('Field required');
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(createHttpRepository().listWords()).rejects.toThrow('Cannot reach Kanzi API');
  });
  it('preserves cancellation and rejects unsupported destructive actions without requests', async () => {
    const repository = createHttpRepository();
    const controller = new AbortController(); controller.abort();
    fetchMock.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));
    await expect(repository.listWords('', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    fetchMock.mockClear();
    await expect(repository.deleteWord('Present')).rejects.toThrow('not supported');
    await expect(repository.deleteMeaning('Present', 'gift')).rejects.toThrow('not supported');
    await expect(repository.searchWords('هدیه')).rejects.toThrow('Persian search is not available');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
