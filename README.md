# Kanzi

A responsive English/Persian vocabulary frontend built with React, TypeScript, Tailwind CSS and Vite. Based on the OpenLing-AI Figma design. No application backend is included.

## Run locally

Use Node.js 22.12+ or 24+.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Production: `npm run build`; preview: `npm run preview`.

## Data modes

The default mock adapter includes 12 dictionary entries and a seven-word starter library. Try `present`, `هدیه`, `responsibility` or `کنجکاوی`. Changes persist in this browser using `kanzi.library.v1` in localStorage. This is a finite demo dictionary, not an online translation service. Different browsers have separate libraries until a backend is connected.

The HTTP adapter now follows the actual `farzin-az/kanzi-api` card endpoints. Copy `.env.example` to `.env.local` and set `VITE_DATA_SOURCE=api`. For local work, keep `VITE_API_BASE_URL=/api`; Vite forwards requests to `KANZI_API_PROXY_TARGET` (default `http://127.0.0.1:8000`). The backend must already be running. No backend is started by the frontend.

The inspected backend supports listing, reading, generating and saving cards. It does not yet support translations, suggestions, deleting saved words or editing saved meanings. Unsupported controls remain visible but disabled in API mode. Demo mode continues to support the complete sample flow and is labeled as a demo in the footer. See `docs/api-contract.md` for setup, exact payloads and remaining gaps. Provider API keys belong only in the backend environment.

## Organization

- `src/domain`: shared word, meaning and repository contracts; bilingual query normalization.
- `src/data`: mock and HTTP adapters; endpoint paths centralized in `httpRepository.ts`.
- `src/features`: library, search and word-card screens.
- `src/components`: shared buttons, icons, search, dialog and feedback states.
- `src/hooks`: cancelable reads and library refresh.
- `src/app`: navigation and application orchestration.
- `src/styles/theme.css`: palette, fonts, radii, button sizes and shared visual tokens.
- `src/styles/app.css`: reusable component layout and responsive behavior.
- `docs/api-contract.md`: actual backend contract, connection setup and unsupported operations.

## Behavior

Search runs on explicit submission or Enter, in either language. Library search replaces the library screen. Discovery separates Match from Suggested and distinguishes New, Already Added and Just added. Added results retain their status for the current discovery session.

New word cards start with all meanings selected. Removing a meaning immediately removes its segment from the draft. Only remaining meaning IDs are submitted when saving. For saved words, removing a meaning permanently updates that card. Removing its last meaning opens the word-deletion confirmation. Empty drafts cannot be added. Adding a duplicate word never restores previously removed meanings.

The mock adapter stores complete saved cards with translations and three examples. The API adapter maps card-level pronunciation and one to three returned examples into the UI, preserving only selected meanings when saving a new card. It never fabricates translations or extra examples. Saved API cards cannot be edited or deleted until the backend supplies those endpoints.

## Checks

```sh
npm test
npm run build
npm run dev
# In another terminal, with Google Chrome installed:
npm run test:e2e
```

Browser checks run against localhost:5173 in desktop and mobile sizes. To use a Playwright-managed Chromium instead, remove `channel: 'chrome'` from `playwright.config.ts` and run `npx playwright install chromium`.

## Deployment

The app is static and uses hash routes, so no server rewrite rules are required. Deploy `dist/` to a static host. `.openai/hosting.json` records the private preview Site identity. Figma icons and fonts are served locally; the deployed app does not depend on temporary Figma asset links.
