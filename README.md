# Isaac Lee's portfolio

A personal portfolio built with React, TypeScript and Vite, published at
[isaacleejm.github.io](https://isaacleejm.github.io/). Project stories cover the
problem, implementation, technology and Isaac's contribution to each project.

The dark, editor-inspired interface uses blue and violet accents, a static
TypeScript profile panel, and expandable project notes. Navigation remains a
regular scrolling website. Project screenshots retain their original appearance;
only their surrounding frames and the architecture diagrams follow the site theme.

## Local development

Use Node.js **22.23.1**, matching CI, and npm.

```sh
npm ci
npm run dev
```

Before publishing, run the checks and inspect the production build:

```sh
npm run lint
npm run test:server
npm run test:chat
npm run build
npm run preview
```

The build command checks TypeScript and writes the static site to `dist/`.
`preview` serves that build locally; GitHub Pages hosts the published site.

## Chatbot development

The `feat/chatbot` branch adds a portfolio assistant in small learning milestones.
The panel now calls the local API, which sends curated portfolio context and
recent conversation history to Gemini. It is visible only with `npm run dev`;
production builds, `npm run preview`, and GitHub Pages omit the widget.

### Configure the backend yourself

Use `server/.env.example` as a reference. If you do not already have a
`server/.env`, copy the template there yourself. If it already exists, update it
in your own editor rather than overwriting it. Set `GEMINI_API_KEY` to your own
[Google AI Studio key](https://aistudio.google.com/apikey).

`GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`; change it server-side if you
need another supported model. See the [model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).
Never put the key in a `VITE_*` variable, a frontend file, or a commit. Real
environment files are ignored by Git; example templates remain trackable.

Only normal backend startup loads `server/.env`, using Node's built-in
`loadEnvFile`. Existing process environment variables take precedence. A missing
file or blank key leaves chat unavailable while `/api/health` still works. Other
file-loading errors stop startup with a sanitized configuration message. Changes
to the environment file require restarting the API.

Codex checks use fabricated configuration, mocked provider replies, and temporary
servers that import the app directly. They do not load real environment files.
You configure credentials and run live Gemini verification yourself.

### Run the complete app

Start the backend in one terminal:

```sh
npm run dev:server
```

It listens at `http://127.0.0.1:3001`. Keep that terminal open; press **Ctrl+C** to
stop it. In a second terminal, start the frontend:

```sh
npm run dev
```

Open Vite's printed URL and **Ask about Isaac**. Vite forwards `/api` requests to
the loopback backend. For another device on the same network, use
`npm run dev -- --host` and open Vite's Network URL on that device. The backend
stays on the computer running Vite; mobile browsers use the frontend's address.
Stop the frontend separately with **Ctrl+C**.

The launcher says **Preview**, and **Details** explains that answers may be
inaccurate and that questions, recent messages, and public portfolio context go
to Google. Its X hides the notice completely; Details shows it again.

### Architecture and conversation behavior

The widget renders the interface, `useChat` manages conversation state, and
`chatClient` posts to `/api/chat`, validates replies, and maps errors to friendly
messages. Express validates the request and invokes an injected reply generator.
Normal startup supplies Gemini; tests supply fakes. There is no runtime demo
fallback.

The server selects descriptive fields from the existing public portfolio data:
profile, skills, education, experience, and all six projects, including motivation,
technologies, contribution details, and public repository links. It omits media
metadata. The instructions preserve team attribution and Rescan's MentorME
Agentic-AI Hackathon in Brisbane and AI-generated implementation disclosure.
Unknown facts should be acknowledged rather than invented. These instructions
help ground answers but do not guarantee accuracy.
The instructions distinguish Isaac, the assistant, and the visitor. A visitor's
name is unknown unless they introduce themselves in the supplied conversation;
Isaac's profile name must not be used as the visitor's name. After Clear, or when
an introduction falls outside the recent history, the assistant should no longer
claim to know that name.

The context goes into Gemini's `systemInstruction`. Validated conversation
messages become `contents`, with `assistant` mapped to Gemini's `model` role.
Each call is stateless: no backend conversation store, embeddings, vector search,
or LangChain is involved. See the [Google Gen AI SDK documentation](https://googleapis.github.io/js-genai/release_docs/).
The provider deadline is 20 seconds, output is capped at 1,024 tokens, automatic
retries and continuation are disabled, and the browser deadline is 30 seconds.

History lives in React state: close/reopen preserves it; refresh clears it.
Each request sends only the newest history fitting the API limits, removing the
oldest complete user/assistant pairs while leaving the full visible transcript.
You can type a draft while waiting; Send and Enter submission stay disabled.
Retry resends the failed conversation without duplicating the user message.
Clear cancels the browser request and ignores late responses; it does not promise
to cancel processing already underway at Google.

### API contract

Check health directly or through Vite, using Vite's actual port:

```sh
curl http://127.0.0.1:3001/api/health
curl http://localhost:5173/api/health
```

Both return `{"status":"ok"}`. Health checks the local process and does not call
Gemini or verify credentials. Test a conversation directly or replace the address
with Vite's URL to exercise the proxy:

```sh
curl http://127.0.0.1:3001/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What did Isaac contribute to PyHelper?"}]}'
```

Successful responses use `{"reply":{"role":"assistant","content":"..."}}`;
content is generated and can vary. Requests contain only `messages`, with only
`role` and `content` per entry. They alternate user/assistant, starting and ending
with user. Content must be nonblank. Limits remain 2,000 characters per user
message, 21 messages, 20,000 total content characters, and 128 KiB UTF-8 JSON.
Character limits use JavaScript string length, matching the UI.

Errors use `{"error":{"code":"...","message":"..."}}`:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | Invalid JSON, message shape, or ordering |
| 413 | `PAYLOAD_TOO_LARGE` | Body or conversation limit exceeded |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Unsupported content type or encoding |
| 405 | `METHOD_NOT_ALLOWED` | Use POST for chat |
| 404 | `NOT_FOUND` | Unknown API route |
| 503 | `CHAT_UNAVAILABLE` | Missing or blank server-side key |
| 429 | `RATE_LIMITED` | Gemini request or quota limit reached |
| 504 | `UPSTREAM_TIMEOUT` | Provider deadline or upstream timeout |
| 502 | `UPSTREAM_ERROR` | Provider failure, blocked/empty reply, or invalid credentials/model |
| 500 | `INTERNAL_ERROR` | Unexpected local failure |

The server does not log message contents, keys, or raw provider failures. The
client displays safe messages rather than raw error response bodies. Browser
entry IDs stay local and are never sent to the API.

### Verification

Automated checks need no credentials:

```sh
npm run test:server
npm run test:chat
npm run lint
npm run build
```

Server tests cover context, attribution, configuration, role mapping, provider
errors, deadlines, and the SDK using fabricated HTTP responses. Client tests cover
bounded history, response validation, cancellation, and UI error messages.
`npm run check:server` checks backend TypeScript; the normal build also checks it,
but only the frontend is written to `dist/`.

Live Gemini verification is **pending until you run it with your own key**:

1. Start both servers and open the panel. In browser developer tools, verify a
   `POST /api/chat` returns HTTP 200 and a generated answer appears.
2. Ask about Telly-Space's motivation and technology, then follow up about Isaac's
   contribution. Check that the answer stays within the documented implemented
   features and understands the recent conversation.
3. Ask what Isaac contributed to PyHelper. Check that it distinguishes his S3,
   SQS, authentication, and integration work from ownership of the entire app.
4. Ask whether Isaac hand-wrote Rescan. Check that the answer names the MentorME
   Agentic-AI Hackathon in Brisbane and its AI-generated implementation.
5. Ask for an unknown fact, such as an award not listed in the portfolio. It
   should acknowledge missing information. Also try asking it to fabricate a
   contribution and check that it does not comply.
6. Clear the chat and ask "What is my name?" It should say it does not know.
   Say "My name is Sam", then ask again; it may use that self-reported name.
   Clear and ask again; Sam must not carry over. "What is Isaac's full name?"
   should still return Isaac Jo Min Lee, while "What is your name?" should
   identify the portfolio assistant rather than Isaac.
7. Stop the API, send a question, and inspect the error. Restart it and Retry;
   the user message should appear only once. Check that typing while waiting,
   Clear during loading, Details/X, and close/reopen still work.
8. Inspect a narrow mobile viewport, then test actual Safari using an iPhone on
   the same network and Vite's Network URL.

Milestone 4 adds Gemini and curated context to the connected UI. Public backend
hosting, persistence, streaming, and future AWS RAG infrastructure remain later
milestones.

## Updating the site

| Location | Purpose |
| --- | --- |
| `src/data/portfolio.ts` | Profile, education, experience, project stories, contribution details and links |
| `src/components/` | Reusable interface components |
| `server/` | Local conversation API, validation, reply generation and tests |
| `shared/chat.ts` | Shared conversation types and limits |
| `src/index.css` | Global styles, theme tokens and typography |
| `src/App.css` | Page layout and responsive styling |
| `public/projects/` | Project screenshots and other local project assets |
| `docs/content-sources.md` | Source evidence and project attribution notes |

Edit the content file to update copy and project links. Featured case studies use
the `projects` array; smaller project cards use `supportingProjects`. Education,
employment and community entries belong to `profile` and share typed layouts.
Add images to
`public/projects/`, then reference them with `/projects/...` paths and descriptive
alternative text in the typed project media. The editable social preview is
`public/social-card.svg`; its PNG export is used by the metadata in `index.html`.
Check phone and desktop layouts, keyboard navigation and
external links before committing.

Keep project descriptions grounded in repository evidence and personal
experience. Attribute team work accurately, distinguish implemented features from
plans, and identify proposed or unmerged contributions. Publish only appropriate
screenshots and working public links; keep private data and credentials out of
the site. Image captions should identify diagrams, widget renders or older
versions when relevant.

## GitHub Pages

[The deployment workflow](.github/workflows/deploy.yml) installs locked
dependencies, lints, tests the API and chat client, and builds pull requests and updates to `main`.
Only successful
`main` builds are uploaded and deployed to the `github-pages` environment. The
workflow can also be run manually with `main` selected.

In the repository's **Settings → Pages → Build and deployment**, select
**GitHub Actions** as the source. The workflow publishes `dist/`; generated files
do not need to be committed. Build jobs receive read access to repository content,
and only the deploy job receives Pages deployment permissions.

Vite's default `/` base is correct for this user site. A future move to
`username.github.io/repository/` requires updating the Vite base and asset paths.
See the [official Vite Pages guide](https://vite.dev/guide/static-deploy.html#github-pages).

## Learning history and attribution

This published version was built with AI assistance. The original React,
TypeScript and Vite starter is preserved at commit
[`2e59ebd`](https://github.com/isaacleejm/isaacleejm.github.io/commit/2e59ebd),
following the initial README commit. A future step-by-step learning rebuild can
start on a separate branch or worktree from that baseline while the portfolio
remains available.

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), with a
body explaining what changed and why for nontrivial changes.
