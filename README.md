# ABI Raid Log

A lightweight local control dock and transparent OBS overlay for tracking **Arena Breakout: Infinite** raid statistics during a live stream.

> Unofficial community utility. This project is not affiliated with or endorsed by MoreFun Studios or Level Infinite.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-5FA04E?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![OBS](https://img.shields.io/badge/OBS-Browser%20Source-302E31?logo=obsstudio&logoColor=white)

## What it does

ABI Raid Log keeps one current streaming session and shows it in two places:

- **Control dock** — quick one-line controls for raids, kills, golds, reds, and extracted Koen.
- **OBS overlay** — a compact transparent glass panel that updates live without refreshing the browser source.

Session data persists across browser refreshes and application restarts. `RESET SESSION` starts a clean session.

## Quick start

Requirements:

- Node.js 20 or newer
- OBS Studio, if you are using the overlay

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

The server uses port `41773` by default and prints the links when it starts:

```text
Control panel: http://localhost:41773/control
OBS overlay:   http://localhost:41773/overlay
```

Open the control panel in a browser, or add it to OBS as a dock using the instructions below.

For development with automatic Node restarts:

```bash
npm run dev
```

To use another port:

```powershell
$env:PORT=12345; npm start
```

## Add the control panel as an OBS dock

The control panel is designed to stay inside OBS while streaming.

1. Start ABI Raid Log with `npm start`.
2. In OBS, open **Docks**.
3. Choose **Custom Browser Docks**.
4. Enter a name, such as `ABI Raid Control`.
5. Enter this URL:

   ```text
   http://localhost:41773/control
   ```

6. Confirm with **Apply** or **OK**.
7. Position the dock wherever it is useful in your OBS layout.

The dock is intentionally minimal. Add a raid result, then add kills, golds, reds, and value as needed. Changes are sent to the overlay immediately.

## Add the overlay to OBS

1. Start ABI Raid Log with `npm start`.
2. Select the scene where the overlay should appear.
3. In **Sources**, click **+** and choose **Browser**.
4. Name the source, for example `ABI Raid Overlay`.
5. Set the URL to:

   ```text
   http://localhost:41773/overlay
   ```

6. Set **Width** to `1920`.
7. Set **Height** to `1080`.
8. Click **OK** and position the source in the scene.

The page background is transparent. Only the compact glass statistics panel appears over gameplay. The browser source updates automatically when the control dock is used.

## Portable Windows build

The repository includes a script for creating a portable application folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-portable.ps1
```

This creates `release/` with the application code, production dependencies, assets, views, and a data directory.

To make the package run on a Windows machine without a Node.js installation:

1. Download the Windows **LTS Binary (.zip)** from [nodejs.org](https://nodejs.org/en/download).
2. Choose the Windows x64 ZIP package, not the MSI installer.
3. Extract it and copy `node.exe` into:

   ```text
   release\node\node.exe
   ```

4. Copy the complete `release/` folder to the target computer.
5. Double-click:

   ```text
   release\start-overlay.bat
   ```

The launcher starts the server and opens the control panel. The OBS URL remains:

```text
http://localhost:41773/overlay
```

The launcher falls back to a system-installed `node` command if the bundled runtime is not present.

## Project structure

```text
src/server.js          Express server, API, SSE, SQLite persistence
views/                 EJS pages and partials
public/css/app.css     Overlay and control-dock styling
public/js/             Browser-side API and SSE clients
public/images/         Local gold, red, Koen, raid, and kill assets
data/                  Runtime database and logs, ignored by Git
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/stats` | Read the current session |
| `GET` | `/api/events` | Subscribe to live session updates via SSE |
| `POST` | `/api/raid` | Add an extracted or failed raid |
| `POST` | `/api/add` | Add kills, golds, reds, or extracted value |
| `POST` | `/api/reset` | Clear the current session |

The API is intended for local use and does not include authentication.

## Persistence and logs

- SQLite database: `data/overlay.sqlite`
- Application log: `data/overlay.log`
- Current state: one active session row
- Currency/value: stored as an integer, never floating point

## Assets

Game-related local assets are kept in `public/images/` where available. Font Awesome is used only as a fallback for icons without a supplied local asset. The project does not depend on remote image URLs.

## License

MIT. See [LICENSE](LICENSE).
