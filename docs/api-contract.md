# Kanzi API integration

The frontend adapter follows the current code in `farzin-az/kanzi-api` (`src/kanzi/api.py`, `models.py`, `db.py` and `llm.py`). No backend files were changed.

## Available endpoints

Paths below include the backend's `/api` prefix.

- `GET /api/cards` returns `string[]` containing saved word names.
- `GET /api/cards/{word}` returns a saved card; missing cards return HTTP 404 with `{"detail":"Card not found"}`.
- `POST /api/cards/{word}/generate` returns a generated card. It does not save it.
- `POST /api/cards` accepts the complete card JSON and returns the saved card with HTTP 201. This endpoint inserts; it is not an update/upsert.

```ts
interface ApiCard {
  word: string;
  pronunciation: string;
  meanings: {
    definition: string;
    examples: string[];
  }[];
}
```

The backend model allows at most three examples; the prompt requests one to three. The UI displays only examples actually returned, without inventing missing sentences. Empty or malformed card payloads surface a readable error. The backend does not currently return translations or stable meaning IDs. The adapter creates deterministic UI-only IDs from meaning content and keeps them out of save requests.

## Frontend behavior

Library reads fetch word names, deduplicate identical names and fetch details in batches of four. Library filtering happens on the client because there is no query endpoint. Discovery checks for an existing saved word ignoring case; otherwise an explicit Search submission calls the generation endpoint. Typing never generates cards. Generated drafts remain in memory so viewing and saving do not generate the word again.

Saving posts only the selected meaning content. A preliminary library lookup avoids duplicate inserts in the normal single-client flow and preserves previously saved selections. Cross-client race prevention and unique word constraints belong to the backend.

## Current backend gaps

- No first-language translations or Persian-to-English discovery. API-mode discovery explains this and rejects Persian queries without calling generation.
- No Match/Suggested search endpoint. Generated or existing cards appear under Match; the adapter does not fabricate suggestions.
- No DELETE word endpoint or update/delete meaning endpoint. The delete button and meaning checkbox remain visible but disabled for saved API cards. Draft meaning selection remains functional before saving.
- No account authentication or per-user library ownership in the inspected code.
- No CORS middleware, documented hosted URL or running service was provided.

Demo mode retains the original bilingual sample behavior, including browser-local deletion. Those demo actions do not alter backend records.

## Start an existing backend and connect locally

In the backend checkout, install its declared dependencies and run its existing entry point:

```sh
uv sync
uv run kanzi-api
```

Generation requires `OPENROUTER_API_KEY` in the backend environment or its `.env`. The inspected backend calls OpenRouter; an OpenAI key is not a drop-in replacement for that configuration. Do not place provider keys in frontend variables or browser code.

In the frontend, copy `.env.example` to `.env.local`:

```dotenv
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=/api
KANZI_API_PROXY_TARGET=http://127.0.0.1:8000
```

Restart the frontend development server. Vite forwards `/api` unchanged to the existing backend, avoiding cross-origin requests during local development. This is a development proxy, not an application backend.

Production builds need either an actual API origin in `VITE_API_BASE_URL` with backend CORS configured, or a hosting reverse proxy for `/api`. The Vite development proxy is not included in static builds. Rebuild after changing frontend environment values.

## Validation

`npm test` checks the real response shape, selected-meaning saves, duplicate handling, FastAPI errors and cancellation using mocked HTTP responses. Browser checks in `tests/api` intercept the same four endpoint shapes in desktop and mobile contexts. They do not claim the backend is running or provider generation was verified.

To run the API-mode browser suite, start a second frontend instance with `VITE_DATA_SOURCE=api` on port 5174, then:

```sh
npx playwright test --config playwright.api.config.ts
```
