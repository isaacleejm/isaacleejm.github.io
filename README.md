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

The `feat/chatbot` branch is adding a portfolio assistant in small learning
milestones. The chat panel is visible only with
`npm run dev`. Production builds and `npm run preview` omit the chat widget.

Open **Ask about Isaac** to try a message, loading feedback, and conversation
history. Messages now reach the local API through Vite's `/api` proxy, and the
panel displays the backend's fixed demo reply. Start both servers using the
commands below. Gemini is not connected and no API key is needed.
The notice’s X hides it completely; use **Details** in the chat header to
show it again. Its content can be replaced with response
accuracy guidance when Gemini is connected.

To test on another device on the same network, run `npm run dev -- --host`
and open the Network URL printed by Vite. Keep the backend running on the same
computer as Vite; the browser uses the frontend's address for API requests.
This supports LAN access over plain HTTP as well as localhost.

History lives in React state: closing and reopening preserves it; refreshing
clears it. Clear chat also cancels a pending browser request and ignores stale
responses. You can type while waiting, but Send and Enter submission remain
disabled until the response arrives. Retry resends the failed conversation
without adding another copy of the user message.

The full transcript stays visible. Each request sends only the newest history
that fits both API limits, dropping the oldest complete user/assistant pairs as
needed. The Details notice explains this behavior and that responses are demos.

The UI code lives
in `src/features/chat/`: the widget renders the interface, `useChat` manages the
conversation, and `chatClient` sends requests, bounds outgoing history, validates
replies, and handles errors and a 30-second timeout. The next milestone adds
curated portfolio context and Gemini with a server-side API key. Retrieval and
public backend hosting come later.

### Local API development

Start the backend in one terminal:

```sh
npm run dev:server
```

It listens at `http://127.0.0.1:3001`. `tsx` restarts it when an imported source
file changes. Keep that terminal open; press **Ctrl+C** to stop it.

Start the frontend in another terminal with `npm run dev`. Vite forwards `/api`
requests to the backend, including when the frontend is shared with `--host`.
Use the frontend URL printed by Vite; its port may change if 5173 is occupied.
Press **Ctrl+C** in that terminal to stop the frontend separately.

Check the API directly, then through Vite (using its actual port):

```sh
curl http://127.0.0.1:3001/api/health
curl http://localhost:5173/api/health
```

Both return `{"status":"ok"}`. Unknown API paths return a JSON 404. Run
`npm run check:server` for server-only type checking; `npm run build` also checks
the server, but only the frontend is written to `dist/` for GitHub Pages.

The API also accepts structured conversations and returns a fixed backend demo
reply. Try it directly or replace the address with Vite’s URL to use the proxy:

```sh
curl http://127.0.0.1:3001/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What projects has Isaac worked on?"}]}'
```

Expected response:

```json
{
  "reply": {
    "role": "assistant",
    "content": "This is a backend demo reply. Gemini is not connected yet."
  }
}
```

Requests contain only `messages`; each message contains only `role` and `content`.
Roles alternate between `user` and `assistant`, starting and ending with `user`.
Content must be nonblank. User messages have a 2,000-character limit; the request
allows 21 messages, 20,000 total content characters, and a 128 KiB UTF-8 JSON body.
Character limits use JavaScript string length, matching the UI’s input limit.

Errors use `{"error":{"code":"INVALID_REQUEST","message":"..."}}`, with HTTP
400 for invalid input, 413 for exceeded limits, 415 for unsupported media, 405
for an unsupported chat method, 404 for unknown routes, and 500 for internal
failures. The API does not retain conversation history or log message content.

`server/index.ts` owns startup and shutdown. The Express app routes a request
through validation, an asynchronous reply generator, and a typed JSON response.
Tests inject generators without starting the normal server; they use temporary
ports and close their listeners afterward. Run them with `npm run test:server`.
The shared transport types and limits live in `shared/chat.ts`; browser entry
IDs and UI state stay inside the chat feature.

### Verify the browser connection

1. Start the API and frontend in separate terminals as described above.
2. Open the frontend URL and **Ask about Isaac**. Open browser developer tools
   and select **Network**.
3. Send a message. Verify a `POST /api/chat` request returns HTTP 200 and the UI
   displays: “This is a backend demo reply. Gemini is not connected yet.”
4. Send a follow-up. Its request should include the previous user message and
   assistant reply, followed by the new question; no UI message IDs are sent.
5. Stop the API with **Ctrl+C**, then send another message. Expect an error with
   **Retry message**. Restart the API and retry; the failed user message should
   appear only once and the reply should arrive.
6. In developer tools, use network throttling to inspect loading behavior. Type
   a new draft while a request is pending and confirm Send/Enter cannot submit
   it yet. The draft should remain after the reply. Clear a pending request and
   verify its eventual response does not restore the old conversation.
7. Check a narrow mobile viewport, Details/X, and close/reopen behavior. For an
   actual Safari check, open Vite's Network URL on an iPhone on the same network.

Client requests show friendly errors for unreachable servers, non-success HTTP
responses, invalid replies, and timeouts; raw server error bodies are not shown.
Run `npm run test:chat` for mocked client tests, including history boundaries and
cancellation. Backend tests and client tests do not need environment files or
credentials. Real environment files are ignored by Git; `.env.example` templates
remain trackable. The current backend does not load environment files.

Milestone 3 verifies the UI-to-API connection. Milestone 4 adds curated portfolio
context and Gemini, then repeats the browser checks with real generated replies.
GitHub Pages continues to publish only the static frontend, without the widget.

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
