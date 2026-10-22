# Deploy the portfolio chatbot

GitHub Pages hosts the React frontend. Render hosts the Express API, which calls
Gemini using a server-side key. This guide deploys the current tested behavior;
it does not change the prompt, model, chat history, or request timeouts.

## 1. Publish the deployment configuration

Run the existing lint, API tests, chat tests, frontend build, and backend build.
Review and commit the deployment changes using Conventional Commits with a body.
Push your branch, open a pull request, and merge into `main` after CI passes.
Keep the repository Actions variable `VITE_CHAT_API_URL` unset for now, so Pages
continues publishing the portfolio with the chatbot hidden.

The [Blueprint](../render.yaml) uses these settings:

| Setting | Value |
| --- | --- |
| Service | `isaac-portfolio-api`, native Node web service |
| Plan / region | Free / Singapore |
| Repository root / branch | Root directory / `main` |
| Node | Existing `.nvmrc`: `22.23.1` |
| Build | `npm ci --include=dev && npm run build:server` |
| Start | `npm run start:server` |
| Health | `/api/health` |
| Automatic code deploys | Off; initial creation still deploys |

Explicitly installing dev dependencies makes TypeScript available during the
production build. Only `dist-server/` is needed as compiled server code at
runtime; no Vite server is involved. Render reads `.nvmrc`; check the build log
uses that version and remove any dashboard `NODE_VERSION` override if it differs.

## 2. Create the backend on Render

1. Sign in to Render and connect the GitHub repository
   `isaacleejm/isaacleejm.github.io`.
2. Choose **New → Blueprint**, select this repository and branch `main`, and
   use the root `render.yaml`. Confirm it creates only one free web service.
3. Enter `GEMINI_API_KEY` yourself when prompted. The Blueprint's `sync: false`
   requests a value without putting it in Git. Do not upload `server/.env`, paste
   the key into chat, or add it to GitHub Pages variables.
4. Create the service. For controlled subsequent changes, set the Blueprint's
   **Auto Sync** to **No** and confirm the service's automatic deploys are off.
   Blueprint syncing and automatic code deployments are separate controls.
5. Wait for the build and startup, then copy the actual assigned HTTPS service
   URL from Render. Do not assume the requested name is the assigned subdomain.

The Blueprint sets `NODE_ENV=production`, `HOST=0.0.0.0`, the current Gemini model,
and `CHAT_ALLOWED_ORIGINS=https://isaacleejm.github.io` (no trailing slash). Leave
`PORT` to Render. Production startup uses injected variables and does not load a
local environment file. No Docker image, database, disk, or custom domain is
needed for this milestone.

`TRUST_PROXY_HOPS=1` is an initial verification setting, not a guarantee about
Render's proxy topology. Complete the isolation and spoof tests below before
enabling the public widget. Keep the frontend disabled if they fail; investigate
the actual forwarding chain instead of blindly increasing the number or trusting
all proxies. See the [rate limiter's proxy guidance](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues).

## 3. Verify the hosted backend

In your own terminal, replace this example with the actual Render origin:

```sh
CHAT_API_ORIGIN='https://your-assigned-service.onrender.com'
curl --max-time 90 -i "$CHAT_API_ORIGIN/api/health"
```

Expect HTTPS and `200` with `{"status":"ok"}`. A sleeping free service can take
about a minute to wake. Health does not prove the Gemini key or model works.

Check browser preflight:

```sh
curl -i -X OPTIONS "$CHAT_API_ORIGIN/api/chat" \
  -H 'Origin: https://isaacleejm.github.io' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Expect `204`, `Access-Control-Allow-Origin: https://isaacleejm.github.io`, and
permission for POST and Content-Type. Repeat with `Origin: https://unlisted.example`;
expect `403`. Health and preflight do not consume chat allowances. Disallowed
origins are rejected before the provider is called. CORS is not authentication:
requests without Origin are still allowed for command-line clients.

### Verify proxy behavior and rate limits without Gemini calls

Use a fresh 10-minute rate-limit window, with no other chat POSTs from your
network. These malformed JSON requests fail validation before Gemini is called:

```sh
for attempt in {1..11}; do
  curl -sS -o /dev/null -w '%{http_code}\n' \
    "$CHAT_API_ORIGIN/api/chat" \
    -H 'Content-Type: application/json' --data '{'
done
```

In Bash, expect ten `400` responses followed by `429`. Inspect the blocked
response and check `Retry-After` and rate-limit headers:

```sh
curl -i "$CHAT_API_ORIGIN/api/chat" \
  -H 'Content-Type: application/json' --data '{'

curl -i "$CHAT_API_ORIGIN/api/chat" \
  -H 'Content-Type: application/json' \
  -H 'X-Forwarded-For: 198.51.100.10' --data '{'

curl -i "$CHAT_API_ORIGIN/api/chat" \
  -H 'Content-Type: application/json' \
  -H 'X-Forwarded-For: 203.0.113.10, 198.51.100.20' --data '{'
```

All three must remain `429`; fabricated forwarded addresses must not create a
new allowance. Before that window expires, repeat one unspoofed malformed POST
from a different public network, for example a computer on a mobile hotspot.
It must return `400`, not share the first network's `429`. If changing networks,
keep the first network's connection disabled during the second check.

If any check fails, do not enable Pages chat. Record the observed behavior and
resolve the proxy configuration first. These checks are necessary because local
proxy tests cannot establish how Render forwards real traffic.

After the rate-limit window expires, check a real Gemini reply:

```sh
curl --max-time 35 -i "$CHAT_API_ORIGIN/api/chat" \
  -H 'Origin: https://isaacleejm.github.io' \
  -H 'Content-Type: application/json' \
  --data '{"messages":[{"role":"user","content":"What projects has Isaac worked on?"}]}'
```

Expect `200` with `reply.role` equal to `assistant` and a relevant nonempty
`reply.content`. `503` means the key was not configured; `502`, `504`, or `429`
requires checking model/provider access, latency, or quota before proceeding.
Do not share secrets while investigating errors.

## 4. Enable the frontend and test the live portfolio

1. Open GitHub repository **Settings → Secrets and variables → Actions →
   Variables**. Add the **repository variable** `VITE_CHAT_API_URL` with the
   complete actual endpoint, such as `https://your-assigned-service.onrender.com/api/chat`.
   Use Variables, not Secrets or an environment-scoped variable. This endpoint
   is deliberately public and contains no key.
2. Open **Actions → Check and deploy portfolio → Run workflow**, select `main`,
   and run it. The build reads the variable; only `dist/` is uploaded to Pages.
3. Open `https://isaacleejm.github.io/`, refresh, and check desktop and mobile.
   In browser Network tools, chat must go to the Render HTTPS URL rather than
   localhost or the Pages origin.
4. Verify a project question and follow-up, typing while loading with Send/Enter
   blocked, Retry without duplicate messages, Clear during loading, close/reopen,
   and fresh history after refresh. Opening Details and hiding the notice must
   still work. Do not intentionally stop the live API just to induce an error;
   offline browser testing can check connection-error recovery.
5. Leave the API idle for more than 15 minutes without health probes or other
   traffic, then send a message. The free service may take about a minute to wake,
   exceeding the browser's 30-second timeout. Let it wake and manually Retry.
   A successful warm reply and recovery are required; a consistently failing
   warm service is not an accepted cold-start limitation.

There is no automatic retry, keep-alive service, or timeout increase in this
milestone. A stronger hosting plan can be considered later if the first-request
experience is unsuitable. See [Render's free-tier behavior and usage limits](https://render.com/docs/free).

## Future deployments, monitoring, and recovery

- Merge tested backend changes into `main`, wait for GitHub CI to pass, then use
  **Manual Deploy → Deploy latest commit** on the Render service. This also
  applies to portfolio data changes: the backend compiles that data into its
  own artifact. Pages deploys independently, so verify both describe the update.
- For Blueprint configuration changes, manually sync the Blueprint and verify
  the applied settings and resulting deployment. Secret changes are made
  directly in the service environment; `sync: false` prompts only at creation.
- Check Render Events/Logs for build and startup failures, and inspect browser
  Network responses for API errors. The app does not log prompts or keys. Check
  Render usage and Gemini quota separately; in-memory limits are not a billing
  cap and reset on restart, redeploy, or idle shutdown.
- To hide chat, delete or blank the repository `VITE_CHAT_API_URL` variable and
  rerun the Pages workflow on `main`. The rest of the portfolio stays available.
  This takes effect after publishing the new frontend; it does not disable the
  publicly reachable API. Suspend the Render service to stop backend requests.
- For a bad backend release, use Render's rollback to an available previous
  successful deploy, then revert the offending source change before the next
  deploy. For a bad Pages release, revert its source change and let CI rebuild.

No AWS resources, chat persistence, embeddings, or vector search are created.
