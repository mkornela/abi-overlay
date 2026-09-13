# ABI Raid Log

A lightweight local control panel and transparent OBS overlay for tracking Arena Breakout: Infinite raid statistics while streaming.

The app stores one current session in SQLite and synchronizes the control panel and OBS overlay immediately using Server-Sent Events.

## Requirements

- Windows, macOS, or Linux
- Node.js 20 or newer
- OBS Studio, if using the overlay

## Build and install

Clone or download this repository, then open a terminal in the project folder.

Install the dependencies:

```bash
npm install
```

The project uses:

- Express.js
- EJS
- SQLite through `sql.js`
- Vanilla JavaScript
- Font Awesome fallback icons
- Winston logging

No database server or external service is required.

## Run the application

Start the app:

```bash
npm start
```

The server runs on port `41773` by default and prints both URLs when it starts:

```text
Control panel: http://localhost:41773/control
OBS overlay:   http://localhost:41773/overlay
```

Open the control panel in a browser:

```text
http://localhost:41773/control
```

Use the control panel to record extracted raids, failed raids, kills, gold items, red items, and extracted Koen value.

For development, use Node's built-in watcher:

```bash
npm run dev
```

To use a different port:

```bash
PORT=12345 npm start
```

On Windows PowerShell:

```powershell
$env:PORT=12345; npm start
```

## Add the control panel as an OBS dock

The control panel is separate from the transparent stream overlay. Add it to OBS as a dock so it is available while streaming.

1. Start the application with `npm start`.
2. Open OBS Studio.
3. Open the **Docks** menu.
4. Choose **Custom Browser Docks**.
5. Enter any name, for example `ABI Raid Control`.
6. Enter this URL:

   ```text
   http://localhost:41773/control
   ```

7. Click **Apply** or **OK**.
8. Dock the new panel wherever it is convenient in OBS.

The dock updates as soon as a statistic is changed. No refresh is required.

## Add the transparent overlay to OBS

Add the overlay as a Browser Source in the scene that is being streamed.

1. Start the application with `npm start`.
2. In OBS, select the scene where the overlay should appear.
3. In the **Sources** panel, click the **+** button.
4. Choose **Browser**.
5. Name it something like `ABI Raid Overlay`.
6. Set the URL to:

   ```text
   http://localhost:41773/overlay
   ```

7. Set **Width** to:

   ```text
   1920
   ```

8. Set **Height** to:

   ```text
   1080
   ```

9. Click **OK**.
10. Position the overlay where it should appear in the scene.

The page background is transparent, so only the glass statistics panel is displayed over the gameplay. The browser source updates automatically when the control dock changes a value.

## Portable Windows package

A portable release folder can be created for a computer that does not have Node.js installed.

Run this from the project folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-portable.ps1
```

This creates a `release/` folder containing the application, production dependencies, public assets, views, and an empty data folder.

Download the Windows Node.js **LTS Binary (.zip)** package from:

```text
https://nodejs.org/en/download
```

Choose the Windows x64 ZIP, not the MSI installer. Extract it and copy `node.exe` into:

```text
release\node\node.exe
```

The final folder should contain:

```text
release/
├── node/
│   └── node.exe
├── node_modules/
├── public/
├── src/
├── views/
├── data/
└── start-overlay.bat
```

Copy the complete `release/` folder to the target Windows computer. Double-click:

```text
release\start-overlay.bat
```

The launcher starts the server and opens the control panel automatically. The OBS overlay URL remains:

```text
http://localhost:41773/overlay
```

The launcher falls back to a system-installed `node` command if `release\node\node.exe` is not present.

## Data and logs

Session data is stored locally at:

```text
data/overlay.sqlite
```

Application logs are written to:

```text
data/overlay.log
```

The `RESET SESSION` button clears all current statistics. It asks for confirmation before deleting the session values.

## API

```text
GET  /api/stats
GET  /api/events
POST /api/raid
POST /api/add
POST /api/reset
```

The API is intended for local use and does not include authentication.

## Assets

The overlay uses local assets from `public/images/` for gold, red, Koen, raids, and kills. Font Awesome is used only where a suitable local icon is not available. No unreliable third-party game asset URLs are required.
