<div align="center">
  <img src="cadence-icon.svg" width="84" height="84" alt="Cadence logo">
  <h1>Cadence</h1>
  <p><strong>Your day, in order of what matters most.</strong></p>
  <p>A calm, self-hosted task dashboard that pulls your <a href="https://asana.com">Asana</a> tasks, prioritises them by urgency, and turns your history into plain-language insights.</p>

  <p>
    <a href="https://marcelwijata.github.io/cadence/"><img src="https://img.shields.io/badge/live-demo-785A00?style=flat-square" alt="Live demo"></a>
    <img src="https://img.shields.io/badge/built%20with-vanilla%20JS-f4eeeb?style=flat-square&labelColor=785A00" alt="Vanilla JS">
    <img src="https://img.shields.io/badge/dependencies-1-785A00?style=flat-square" alt="One dependency">
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-785A00?style=flat-square" alt="MIT License"></a>
  </p>
</div>

---

## What it is

Cadence is a single-file web app. You open it, paste a personal Asana token once, and it becomes a focused daily dashboard:

- **My Tasks** — every assigned task, grouped by what to do *now* (overdue + today), this week, strategic (no due date), and upcoming. Filter by project, search, tick things off, and keep private notes that never sync back to Asana.
- **Insights** — your completion history in plain English. How much you finished, how often you hit your dates, where your effort went, and a few gentle, specific recommendations.

It's deliberately small: no accounts, no server you have to run, no build step. The whole app is one `index.html` file you can host anywhere static.

> **Live demo:** **<https://marcelwijata.github.io/cadence/>**

## Highlights

| | |
|---|---|
| 🎯 **Urgency-first layout** | Tasks bucket automatically into Do-now / This-week / Strategic / Upcoming based on due dates. |
| 🏷️ **Self-configuring filters** | Project filters are built from *your* real Asana projects — no hardcoded config. Works for any account. |
| 📊 **Plain-language insights** | On-time rate, weekly pace, where your work goes, and human recommendations — not jargon. |
| 🔔 **Mentions & reminders** | A bell that surfaces recent comments and @mentions, plus pop-up reminders for tasks due today or overdue. |
| 🗒️ **Private notes** | Jot notes against any task or member-case group. Stored locally, never pushed to Asana. |
| 📱 **Readable on any screen** | Large, legible type tuned for desktop and mobile alike. |
| 🔒 **Your token stays yours** | The Asana token lives only in your browser's `localStorage` (or, in the Apps Script option, in your own Google account). |

## Quick start

You don't need to install anything to use the hosted version.

1. Open **<https://marcelwijata.github.io/cadence/>**
2. Create an Asana **Personal Access Token** at [app.asana.com/0/my-apps](https://app.asana.com/0/my-apps) → *Create new token*.
3. Paste it into Cadence and click **Connect**. That's it.

The token is stored only in your browser. To remove it, click the ⚙ settings icon or clear the site's data.

## Self-hosting

Three ways to run your own copy, from easiest to most private.

### Option A — Fork and use GitHub Pages

1. Fork this repo.
2. In your fork: **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
3. Your copy goes live at `https://<your-username>.github.io/cadence/`.

`index.html` is fully standalone — Pages serves it as-is.

### Option B — Any static host

Because it's one file, you can also drop `index.html` onto Netlify, Vercel, Cloudflare Pages, an S3 bucket, or even open it locally. No build, no environment variables.

### Option C — Google Apps Script (most private)

Runs the Asana fetch **server-side** inside your own Google account, so the token never touches the browser and there are no CORS calls. Good for locking the dashboard to just you.

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Paste [`apps-script/Code.gs`](apps-script/Code.gs) over the default `Code.gs`.
3. Add an HTML file named **`Index`** and paste the contents of [`index.html`](index.html) into it.
4. Edit `saveToken()`, paste your Asana token, run it once, then delete the token from the code.
5. **Deploy → New deployment → Web app** — *Execute as: Me*, *Who has access: Only myself*.
6. Bookmark the web-app URL (and add it to your phone's home screen).

Cadence auto-detects Apps Script and uses the server-side path; otherwise it fetches directly from the browser.

## How it works

```
┌─────────────┐     Bearer token      ┌──────────────────┐
│  index.html │ ────────────────────► │   Asana REST API  │
│  (browser)  │ ◄──────────────────── │  app.asana.com    │
└─────────────┘     tasks + stories   └──────────────────┘
       │
       ├─ processTask()      → tag member cases, attach project names
       ├─ buildProjectIndex()→ derive filters + colours from real projects
       ├─ bucket()           → overdue / today / week / nodate / upcoming
       ├─ renderAll()        → prioritised task view
       └─ renderStats()      → completion history → charts + insights
```

- **Tasks** come from `GET /tasks?assignee=me&completed_since=now` (incomplete) and, for Insights, `completed_since=<period start>` to include recent completions.
- **Notifications** read each recent task's `stories` (comments) and flag the ones that mention you.
- **Project filters and chart colours** are derived at runtime from the `projects` field on your tasks — a project name always maps to the same colour via a small deterministic hash, so nothing is hardcoded to any particular workspace.
- **Notes** are kept in `localStorage` under `anotes_<taskGid>` and are never written back to Asana.

## Privacy & security

- The only secret is your Asana Personal Access Token. In the hosted/static modes it stays in `localStorage` on your device; in the Apps Script mode it lives in your Google account's user properties.
- All Asana calls go directly from your browser (or your Apps Script) to `app.asana.com` over HTTPS. There is no Cadence backend and no third party in between.
- Private notes never leave your browser.
- Revoke a token any time from [app.asana.com/0/my-apps](https://app.asana.com/0/my-apps).

## Tech stack

- **HTML + vanilla JavaScript** — no framework, no bundler.
- **[Chart.js](https://www.chartjs.org/)** (via CDN) — the one runtime dependency, for the Insights charts.
- **[Lora](https://fonts.google.com/specimen/Lora)** — the serif typeface.
- **Google Apps Script** — optional server-side backend.

## Project structure

```
cadence/
├── index.html            # the entire app — markup, styles, and logic in one file
├── cadence-icon.svg      # square app icon (also the source for the favicon)
├── cadence-logo.svg      # icon + wordmark lockup
├── apps-script/
│   └── Code.gs           # optional Google Apps Script backend
├── README.md
└── LICENSE
```

## Local development

There's no build. To preview locally, serve the folder with any static server:

```bash
# Python
python -m http.server 3737

# or Node
npx serve .
```

Then open <http://localhost:3737/index.html>. Edit `index.html` and refresh.

## Deploying updates

On GitHub Pages, every push to `main` redeploys automatically (~1 minute):

```bash
git add index.html
git commit -m "Describe your change"
git push
```

On Apps Script, re-paste the updated `index.html` into the `Index` file, then **Deploy → Manage deployments → edit → New version**. The web-app URL stays the same.

## Roadmap

- [ ] Optional light/dark theme toggle
- [ ] Export insights as a shareable summary
- [ ] Snooze / reschedule a task without leaving Cadence

Contributions and ideas are welcome — open an issue or a pull request.

## License

[MIT](LICENSE) — do what you like, no warranty.
