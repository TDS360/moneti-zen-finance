# AI Coach + Final Polish

## 1. AI Coach backend (streaming)

- `src/lib/ai-gateway.ts` — Lovable AI Gateway provider helper (openai-compatible, `Lovable-API-Key` + `X-Lovable-AIG-SDK` headers).
- `src/routes/api/chat.ts` — TanStack server route, `POST` handler:
  - Auth via `requireSupabaseAuth` (verify thread belongs to user).
  - `streamText` with `google/gemini-3-flash-preview`, Moneti finance-coach system prompt (budgeting, saving, investing basics; not licensed advice).
  - Pass `abortSignal: request.signal`.
  - `toUIMessageStreamResponse({ originalMessages, onFinish })` — on non-aborted finish, insert assistant message into `chat_messages` with `supabaseAdmin`.

## 2. AI Coach UI (threaded)

Install AI Elements: `conversation`, `message`, `prompt-input`, `shimmer`.

- `src/routes/_app/coach.tsx` — index, redirects to latest thread or creates a new one and navigates to `/coach/$threadId`.
- `src/routes/_app/coach.$threadId.tsx`:
  - Left rail: thread list (title, updatedAt) + "New chat" button.
  - Right pane: `Conversation` → `Message`/`MessageResponse` rendering `message.parts` (markdown via `MessageResponse`).
  - `PromptInput` with `PromptInputTextarea` + `PromptInputFooter` (right-aligned `PromptInputSubmit`).
  - `useChat({ id: threadId, messages: initial, transport: DefaultChatTransport({ api: '/api/chat', body: { threadId } }) })`.
  - Stop button wired to `stop()`; client `onFinish({ isAbort })` persists partial assistant message with `_Stopped._` marker (ref guard).
  - Shimmer "Thinking…" during `submitted`.
  - Textarea autofocus on mount, after send, after thread switch.
  - Auto-generate thread title from first user message (first 60 chars) via serverFn.
- Sidebar entry "AI Coach" links to `/coach`.

## 3. Server functions

- `src/lib/coach.functions.ts`:
  - `listThreads` — current user's threads ordered by `updated_at`.
  - `createThread` — insert new thread, returns id.
  - `getThread` — thread + messages (validated `UIMessage[]`).
  - `renameThread`, `deleteThread`.
  - `saveUserMessage` — called on submit so user message persists immediately.

## 4. Homepage + auth polish

- Replace any `Sparkles` agent identity with a generated Moneti mark (`src/assets/moneti-logo.png`, transparent).
- Homepage: add AI Coach preview section (chat mock with sage bubbles), testimonials grid, final CTA, footer.
- Auth pages: ensure Google button calls `configure_social_auth` already done; polish layout (split panel with logo + quote).
- Settings: theme toggle (light/dark via `next-themes` already present), profile name edit using existing `profiles` row.

## 5. Misc polish

- `public/llms.txt` + `public/robots.txt` + `public/sitemap.xml` for public routes only (`/`, `/login`, `/signup`).
- Per-route `head()` titles/descriptions on `/`, `/login`, `/signup`.
- Confirm `attachSupabaseAuth` is registered in `src/start.ts` (already done).

## Technical notes

- Model: `google/gemini-3-flash-preview` via Lovable AI Gateway. `LOVABLE_API_KEY` already present.
- Use `stepCountIs(50)`; no tools in v1.
- Messages stored as `parts jsonb` on `chat_messages` (UUID PK). Thread reload converts rows back to `UIMessage[]` and validates with `validateUIMessages`.
- `PromptInputSubmit` patched to render stop icon during both `submitted` and `streaming` (per abort-cancel contract).
