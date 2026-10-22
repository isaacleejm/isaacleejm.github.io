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
npm run build:server
npm run preview
```

The build command checks TypeScript and writes the static site to `dist/`.
`preview` serves that build locally; GitHub Pages hosts the published site.

## Chatbot development

The `feat/chatbot` branch adds a portfolio assistant in small learning milestones.
The panel now calls the local API, which sends curated portfolio context and
recent conversation history to Gemini. Development uses Vite's local proxy.
Production builds show the widget only when `VITE_CHAT_API_URL` is configured;
leaving it blank keeps the published portfolio unchanged.

### Configure the backend yourself

Use `server/.env.example` as a reference. If you do not already have a
`server/.env`, copy the template there yourself. If it already exists, update it
in your own editor rather than overwriting it. Set `GEMINI_API_KEY` to your own
[Google AI Studio key](https://aistudio.google.com/apikey).

`GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`; change it server-side if you
need another supported model. See the [model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).
Never put the key in a `VITE_*` variable, a frontend file, or a commit. Real
environment files are ignored by Git; example templates remain trackable.

Development backend startup loads `server/.env`, using Node's built-in
`loadEnvFile`. With `NODE_ENV=production`, startup never reads that file and
uses injected process variables instead. Existing process environment variables take precedence. A missing
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
`chatClient` posts to the configured endpoint, validates replies, and maps errors to friendly
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
| 403 | `ORIGIN_NOT_ALLOWED` | Origin is not in the configured allowlist |
| 413 | `PAYLOAD_TOO_LARGE` | Body or conversation limit exceeded |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Unsupported content type or encoding |
| 405 | `METHOD_NOT_ALLOWED` | Use POST for chat |
| 404 | `NOT_FOUND` | Unknown API route |
| 503 | `CHAT_UNAVAILABLE` | Missing or blank server-side key |
| 429 | `RATE_LIMITED` | Local request limit or Gemini quota reached |
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
npm run build:server
```

Server tests cover context, attribution, configuration, role mapping, provider
errors, deadlines, and the SDK using fabricated HTTP responses. Client tests cover
bounded history, response validation, cancellation, endpoint selection, and UI error messages. Hosting tests cover
configuration, CORS/preflight, rate-limit boundaries and resets, and proxy trust.
`npm run check:server` checks backend TypeScript; the normal build also checks it,
but only the frontend is written to `dist/`.

Run live Gemini verification yourself with your own key:

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

### Hosting preparation (milestone 5)

This milestone prepares a single-process Node backend and an optional public
frontend endpoint. GitHub Pages serves the static frontend; the API runs on a
separate host. Milestone 6 adds Render configuration and a deployment guide;
adding those files does not create cloud resources or publish the API.

Build and start the backend independently of Vite:

```sh
npm run build:server
NODE_ENV=production HOST=127.0.0.1 PORT=3002 CHAT_ALLOWED_ORIGINS=http://127.0.0.1:4173 npm run start:server
```

This local production smoke command needs no key: health works, while chat
returns `503 CHAT_UNAVAILABLE` unless a key is separately injected into the
process. It intentionally does not read your development key file. `start:server`
runs `node dist-server/server/index.js` without `tsx`. `dist-server/` contains
compiled backend/shared code and portfolio data, excludes tests and environment
files, is ignored by Git, and is separate from Vite's `dist/`. Rebuild it after
backend or portfolio changes; the compiled server does not watch source files.

For local production frontend verification, use another terminal:

```sh
VITE_CHAT_API_URL=http://127.0.0.1:3002/api/chat npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Open exactly `http://127.0.0.1:4173` so it matches the allowed origin above. The
widget appears and reaches the separate API; without an injected key, expect
the friendly configuration error. Stop each process with **Ctrl+C**. To restore
the usual production artifact with the widget hidden, build with the variable
blank: `VITE_CHAT_API_URL= npm run build`.

`VITE_CHAT_API_URL` is public and fixed at build time. It is the complete endpoint,
not a base URL: for example `https://api.example.com/api/chat`. Changing it requires
rebuilding the frontend. Both development and production honor it; development
falls back to `/api/chat` when it is blank. Hosted endpoints require HTTPS; HTTP
is accepted only on `localhost`, `127.0.0.1`, and `[::1]` for local verification.
Credentials, query strings and fragments are rejected, and invalid configuration
stops the Vite build/start. Never include an API key. The root `.env.example`
documents this public setting; do not overwrite an existing environment file.

Backend configuration is parsed separately from loading secrets:

| Variable | Default / behavior |
| --- | --- |
| `NODE_ENV` | `development`; use `production` on a host. `test` is also accepted. |
| `HOST` | `127.0.0.1` locally, `0.0.0.0` in production; may be overridden. |
| `PORT` | `3001`; accepts integers from 1 through 65535. Honor the host's injected port. |
| `CHAT_ALLOWED_ORIGINS` | Empty in development; required in production. Comma-separated exact HTTP(S) origins, without paths, wildcards, or trailing slashes. |
| `TRUST_PROXY_HOPS` | `0`; nonnegative integer matching the verified deployment proxy topology. |
| `GEMINI_API_KEY` | Backend secret only; missing/blank means unavailable chat, not a failed health check. |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite`. |

For the eventual live portfolio, set `CHAT_ALLOWED_ORIGINS` to
`https://isaacleejm.github.io`. Add other origins only if intentionally supported.
With an allowlist, `/api/chat` supports JSON POST preflight, reflects only an
allowed origin, and does not use cookies. A disallowed Origin receives
`403 ORIGIN_NOT_ALLOWED` before the provider is called. Browser JavaScript on
that origin cannot read the response because it has no CORS permission. Requests
without Origin are allowed for command-line clients, so CORS is not authentication.
Development without an allowlist adds no cross-origin permissions, preserving
the same-origin Vite proxy and LAN HTTP behavior. An explicit development
allowlist can be used to test cross-origin access.

Production limits allow 10 POST attempts per IP and 60 admitted attempts across
the process within 10 minutes. Per-IP rejection happens before the process
counter. Limits include failed attempts; health and preflight do not count.
Excess requests return `429 RATE_LIMITED`, `Retry-After`, and standard rate-limit
headers. Allowed-origin browser clients can read these headers and error bodies.
Retry remains manual. Limits use memory, reset on restart, do not coordinate
across multiple instances, and are not a hard billing cap. A distributed store
and hosting-specific protections are deferred.

Local proxy trust defaults to zero. The Render Blueprint starts with one trusted
hop as a candidate to verify before enabling the public widget. Blindly trusting
forwarded headers can let clients bypass IP limits;
not trusting a real proxy can group all visitors under the proxy IP. The global
counter is independent of the IP key. See the [proxy guidance](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues),
[CORS documentation](https://expressjs.com/en/resources/middleware/cors/), and
[rate-limit store limitations](https://express-rate-limit.mintlify.app/overview).

CI builds both artifacts but uploads only `dist/` to GitHub Pages. Persistence,
streaming, authentication, and future AWS RAG infrastructure remain later
milestones.

### Render deployment (milestone 6)

The root [Render Blueprint](render.yaml) defines a free Node web service in
Singapore, built from `main` with the existing Node version in `.nvmrc`. Render
installs build dependencies, compiles the backend, and starts the emitted
JavaScript. Its injected `PORT` is used automatically. Backend deployments are
manual; the initial Blueprint creation still builds and deploys the service.

Follow the [Render deployment guide](docs/render-deployment.md) to create the
service, enter your Gemini key directly in Render, verify HTTPS/CORS and proxy
rate limits, then enable the widget. Keep the GitHub repository Actions variable
`VITE_CHAT_API_URL` unset until those checks pass. Set it to the actual Render
HTTPS URL ending in `/api/chat`, then run the Pages workflow on `main`.

The free service sleeps after 15 idle minutes and may take about a minute to
wake. A first-request timeout and manual Retry are accepted for this initial
deployment. The guide covers cold-start testing, logs, usage, and rollback.

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
dependencies, lints, tests the API and chat client, and builds both the frontend
and backend for pull requests and updates to `main`.
Only successful
`main` builds are uploaded and deployed to the `github-pages` environment. The
workflow can also be run manually with `main` selected.

The frontend build receives the public endpoint from the repository Actions
variable `VITE_CHAT_API_URL`. It is a URL, not a secret. When unset or blank, the
production chatbot stays hidden. Changing this variable requires a new Pages
build; it does not modify an already published bundle. The Gemini key belongs
only in the backend host's environment.

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
