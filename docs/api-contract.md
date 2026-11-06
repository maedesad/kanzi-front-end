# Proposed vocabulary API contract

This is an adapter contract for future integration, not an implemented backend. All paths are relative to `VITE_API_BASE_URL`. Adjust paths, mapping and authentication in `src/data/httpRepository.ts` once actual endpoints are supplied. React screens depend only on `VocabularyRepository`.

## Models

```ts
interface Meaning {
  id: string;
  pronunciation: string;
  definition: string;
  translation: string;
  examples: [string, string, string];
}
interface Word {
  id: string;
  text: string;
  meanings: Meaning[];
}
interface SearchResults {
  match: Word[];
  suggested: Word[];
}
```

IDs are opaque and stable. Different meanings of a word must have distinct IDs. A saved card must have at least one meaning. Do not change meaning IDs when reordering them.

## Endpoints

- `GET /library/words?q=` → `Word[]`. Empty `q` returns the whole saved library; otherwise search English text and Persian translations. Include only meanings the user kept.
- `GET /words/:wordId` → `Word`. Returns a dictionary card. The UI prefers kept meanings from the library for saved words.
- `GET /words/search?q=` → `SearchResults`. Return exact matches separately from relevant suggestions, without duplicate word IDs across groups. Search both languages and normalize Persian/Arabic keyboard variants.
- `POST /library/words` with `{ "wordId": "present", "meaningIds": ["gift", "here"] }` → the saved `Word`. The operation should be idempotent for an already saved word and preserve its existing kept meanings. Reject an empty meaning list.
- `DELETE /library/words/:wordId` → `204 No Content`. Remove the user's saved card, keeping the source dictionary entry intact.
- `DELETE /library/words/:wordId/meanings/:meaningId` → updated saved `Word`. Remove permanently from that user's card. The UI deletes the whole card through the word endpoint when its last meaning is removed, after confirmation.

## Errors, auth and future scaling

Return non-2xx status codes with `{ "message": "A useful user-facing explanation." }`. Reads support AbortSignal cancellation. Requests use `credentials: 'include'`; the backend owns session authentication, CORS, CSRF protection and authorization. No credentials are embedded in the frontend.

The initial adapter expects a complete library and complete search result arrays. Pagination, server ordering, user settings, language selection and authentication screens can be added once their backend contracts are known. No backend, fake API server or authentication service has been created.
