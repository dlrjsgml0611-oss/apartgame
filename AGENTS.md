# Repository Guidelines

## Project Structure & Module Organization
This Next.js 15 App Router project keeps UI routes in `app/`: `page.tsx` handles the valuation flow, `layout.tsx` wires providers, `globals.css` hosts base Tailwind layers, and `api/analyze/route.ts` orchestrates location and AI calls. Components live under `components/`, shared helpers under `lib/` (`ai-analysis.ts`, `location.ts`), and types under `types/index.ts`. Keep configuration (`tailwind.config.ts`, `next.config.js`, `tsconfig.json`) and assets out of feature code; add static files to a `public/` subtree when needed.

## Build, Test, and Development Commands
- `npm install` – install dependencies declared in `package.json`.
- `npm run dev` – Next dev server on http://localhost:3000 using your `.env`.
- `npm run build` – production build plus type checking.
- `npm run start` – serve the last build from `.next`.
- `npm run lint` – run the `eslint-config-next` rule set before every PR.

## Coding Style & Naming Conventions
Write strict TypeScript with the `@/*` alias. Prefer functional React components with hooks and only add `"use client"` when browser APIs are needed. Keep two-space indentation, express UI through Tailwind utilities, and reserve `app/globals.css` for shared tokens. Components remain PascalCase, helpers camelCase, and shared types centralised in `types/index.ts`. Network/AI orchestration belongs in `lib/` to avoid duplicating fetch logic.

## Testing Guidelines
No automated suite exists yet, so new features should add tests. Use React Testing Library with Vitest or Jest, naming files `*.test.ts(x)` or `*.spec.ts(x)` next to the module or inside `__tests__/`. Mock OpenAI, Anthropic, Kakao, and public-data clients to keep runs deterministic. Always ensure `npm run lint` and `npm run build` pass, and note any manual scenarios exercised (address parsing, AI-provider toggles, error banners) in the PR.

## Commit & Pull Request Guidelines
History already follows Conventional Commits (`feat:`, `refactor:`), so keep the lowercase type prefix, optional scope, and imperative summary, then squash noisy WIP commits. Every PR should describe what changed and why, link the issue or task ID, attach screenshots or Looms for UI updates, call out new env vars/migrations, and list verification steps (commands run, tests, manual QA). Favor smaller, single-scope PRs—split API and UI work whenever possible.

## Security & Configuration Tips
Copy `.env.example` to `.env` and populate `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `KAKAO_API_KEY`, plus optional public-data keys; never commit secrets or real user addresses. Redact coordinates before sharing logs. For debugging, prefer stub responses in `lib/location.ts` over editing production keys, and remove any mock fixtures before pushing.
