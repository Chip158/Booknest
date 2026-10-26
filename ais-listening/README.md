# AIS Social Listening

Watches news and public social posts about AIS's OpCos, projects and locations
twice a day (7 AM and 7 PM Pacific), scores each result for relevance and
sentiment, and shows everything on a password-protected dashboard that works on
a phone.

## What's where

| You want to change… | Edit |
|---|---|
| OpCo brand colors, scan times, relevance cut-off, Claude model | `config/settings.js` (then `npm run deploy`) |
| Topics: keywords, context terms, exclude terms, pause/remove | The **Topics** section of the dashboard |
| Starting topics (used only on the very first run) | `config/seed-topics.js` |
| Turn a source off | `DISABLED_SOURCES` in `wrangler.toml` |

## What the team sees first

The team cares most about stories and posts that **name one of our companies**
or **show our logo or branded equipment in a photo**. Those come first, and
only negative stories of that kind go into "Needs attention". Coverage of a
project or site that neither names nor shows us is listed after them as lower
priority.

For every new result the scanner opens the page and reads the full article.
Google News links are first converted to the publisher's real address. It
collects the lead photos (up to 3) and asks Claude:

- Is one of our companies named in the text? Names per OpCo are in
  `config/settings.js` (`names`).
- Does a photo show our logo or branded equipment? What each logo looks like is
  in `logo`. Optionally, drop a PNG of each logo in `public/logos/` and set
  `logoFile`, which makes the photo check more reliable.

Limits:
- Some sites block automated readers (Reuters, Medium and others return
  "403"). Those results are checked on the headline only and labeled
  "Headline only".
- The photo check needs `ANTHROPIC_API_KEY`. Without it, photos are shown on
  the card but not checked.
- The searches are text-based. A photo of our equipment in a post that never
  mentions any of our topic keywords or project names won't be found. Finding
  those needs a paid image-recognition listening tool (e.g. Brandwatch,
  Talkwalker, Meltwater).

## How a result gets on the dashboard

1. **Search.** Each topic is searched on every source. News engines get the
   keywords, context terms and excludes as a boolean query, so they match on the
   full article text.
2. **Rules gate.** A result must mention a keyword **and** a context term and
   none of the exclude terms. Short ALL-CAPS acronyms (AISI, RSI, NWDD) only
   match as exact, case-sensitive words.
3. **Dedupe.** Results already seen are skipped. The same story from several
   outlets is grouped into one card ("Also covered by…").
4. **Relevance check.** Claude reads each new result with the topic's terms and
   the team's past "Not relevant" clicks, then returns a 0–100 relevance score,
   a sentiment and a short "why it matched" note. Results below the cut-off
   (default 60) are hidden unless "Show low-confidence" is on.
5. **Feedback.** "✕ Not relevant" is sent to the relevance check as an example
   on later scans. Sources the team keeps dismissing are scored lower.

Without an `ANTHROPIC_API_KEY`, step 4 falls back to keyword rules, which are
much noisier. Each card says which method scored it.

## Sources

| Source | Cost | Key needed | Status |
|---|---|---|---|
| Google News RSS | Free | No | On |
| GDELT (global news, incl. small local outlets) | Free | No | On. Limited to 1 request / 5 s, so topics run one at a time |
| Bluesky public posts | Free | No | On |
| Reddit | Free | Yes: free Reddit "script" app (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`) | Off until keys are added. Reddit blocks anonymous API access. Reddit's terms require approval for commercial use |
| Bing News RSS | Free | No | **Off.** The feed's terms allow only "personal, non-commercial use" |
| LinkedIn & Facebook public pages via Brave web search | **Paid**: about $5 per 1,000 searches after a $5/month credit. About 1,440 searches/month at the default settings, so roughly $2–5/month | `BRAVE_API_KEY` | Off until a key is added |
| Claude relevance check | **Paid**: about $1/month with the default `claude-haiku-5-5` | `ANTHROPIC_API_KEY` | Needed for accuracy |
| Cloudflare hosting | Free plan | No | |

LinkedIn, Facebook, Instagram and X have no API for searching public posts. The
Brave option only finds posts and pages that search engines have indexed. Full
coverage of those networks needs a paid listening tool (Cision, Meltwater,
Brandwatch). If AIS already pays for Cision, check its monitoring module first.

## Hosting & security

All of it runs on Cloudflare: a Worker for the dashboard, API and scanner, D1
(SQLite) for topics, results and history, a Queue that runs one topic per
invocation, and an hourly Cron Trigger. Nothing depends on a laptop being on.

- Everything except the login page requires a password. There are no user
  accounts. Anyone with the web address and a password can sign in on any
  device. Passwords and API keys are stored as encrypted Cloudflare secrets,
  never in code.
- Two passwords:
  - **Team password** (`DASHBOARD_PASSWORD`): full access.
  - **View-only password** (`VIEWER_PASSWORD`, optional): for people who should
    look but not change anything, such as leadership. They see every result,
    filter and the trend chart, but get no Check now, Reviewed, Not relevant,
    Star or topic-editing controls. The server also refuses any change from a
    view-only sign-in. Leave it unset to turn view-only access off; change it
    to revoke access.
- Sign-in cookies are HttpOnly, Secure, SameSite=Strict and HMAC-signed. They
  last 30 days. Changing `SESSION_SECRET` signs everyone out.
- After 8 wrong passwords, an IP address is locked out for 15 minutes.
- Strict Content-Security-Policy, no third-party scripts, and the dashboard
  can't be embedded in other sites. Pages carry `noindex`.
- Later option: put Cloudflare Access (email one-time code, free for up to 50
  users) in front of it as a second layer.

## One-time setup (about 20 minutes)

You need a free Cloudflare account and Node.js 20+.

```bash
cd ais-listening
npm install
npx wrangler login                               # opens the browser

npx wrangler d1 create ais-listening             # copy the database_id it prints…
#   …and paste it into wrangler.toml (database_id = "…")
npx wrangler queues create ais-listening-scan
npm run db:remote                                # creates the tables

npx wrangler secret put DASHBOARD_PASSWORD       # the shared team password
npx wrangler secret put SESSION_SECRET           # paste a long random string (e.g. `openssl rand -hex 32`)
npx wrangler secret put VIEWER_PASSWORD          # optional: view-only password for leadership
npx wrangler secret put ANTHROPIC_API_KEY        # from console.anthropic.com
# optional:
# npx wrangler secret put BRAVE_API_KEY
# npx wrangler secret put REDDIT_CLIENT_ID
# npx wrangler secret put REDDIT_CLIENT_SECRET

npm run deploy                                   # prints your https://ais-listening.<you>.workers.dev URL
```

Open the URL, sign in, and press **Check now** for the first scan. A first scan
looks back 30 days and takes a few minutes. The page updates on its own as
topics finish.

## Running it locally

```bash
printf 'DASHBOARD_PASSWORD=test\nSESSION_SECRET=%s\n' "$(openssl rand -hex 32)" > .dev.vars
npm run db:local
npm run dev            # http://localhost:8787
npm test               # accuracy-rule, dedupe and schedule tests
```

## Changing the schedule

Edit `SCAN_HOURS_PACIFIC` in `config/settings.js`. The cron in `wrangler.toml`
fires every hour, and the code scans only at those Pacific hours, so daylight
saving time is handled automatically.
