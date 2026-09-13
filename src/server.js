const express = require("express");
const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");
const winston = require("winston");

const app = express();
const PORT = process.env.PORT || 41773;
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "overlay.sqlite");
fs.mkdirSync(dataDir, { recursive: true });
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(dataDir, "overlay.log"),
    }),
  ],
});
let db;
const clients = new Set();
const save = () => fs.writeFileSync(dbPath, Buffer.from(db.export()));
const getStats = () => {
  const row = db.exec(
    "SELECT raids, extracted, failed, kills, gold, red, extracted_value FROM session_stats WHERE id = 1",
  )[0].values[0];
  return {
    raids: row[0],
    extracted: row[1],
    failed: row[2],
    kills: row[3],
    gold: row[4],
    red: row[5],
    extractedValue: row[6],
  };
};
const broadcast = () => {
  const payload = `data: ${JSON.stringify(getStats())}\n\n`;
  for (const res of clients) res.write(payload);
};
const updateStats = (field, amount) => {
  db.run(
    `UPDATE session_stats SET ${field} = ${field} + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
    [amount],
  );
  save();
  broadcast();
};
const validAmount = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && Number.isInteger(n);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  "/vendor/fontawesome",
  express.static(
    path.join(
      __dirname,
      "..",
      "node_modules",
      "@fortawesome",
      "fontawesome-free",
    ),
  ),
);
app.get("/", (req, res) => res.redirect("/control"));
app.get("/control", (req, res) => res.render("control"));
app.get("/overlay", (req, res) => res.render("overlay"));
app.get("/api/stats", (req, res) => res.json(getStats()));
app.get("/api/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write(`data: ${JSON.stringify(getStats())}\n\n`);
  clients.add(res);
  req.on("close", () => clients.delete(res));
});
app.post("/api/raid", (req, res) => {
  const type = req.body.type;
  if (!["extracted", "failed"].includes(type))
    return res
      .status(400)
      .json({ error: "Raid type must be extracted or failed." });
  const field = type === "extracted" ? "extracted" : "failed";
  db.run(
    `UPDATE session_stats SET raids = raids + 1, ${field} = ${field} + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
  );
  save();
  broadcast();
  logger.info(`Raid recorded: ${type}`);
  res.json(getStats());
});
app.post("/api/add", (req, res) => {
  const fields = {
    kills: "kills",
    gold: "gold",
    red: "red",
    extractedValue: "extracted_value",
  };
  const field = fields[req.body.field];
  const value = Number(req.body.value);
  if (!field || !validAmount(value))
    return res
      .status(400)
      .json({ error: "Enter a whole number of zero or more." });
  updateStats(field, value);
  logger.info(`Added ${value} to ${field}`);
  res.json(getStats());
});
app.post("/api/reset", (req, res) => {
  db.run(
    "UPDATE session_stats SET raids=0, extracted=0, failed=0, kills=0, gold=0, red=0, extracted_value=0, updated_at=CURRENT_TIMESTAMP WHERE id=1",
  );
  save();
  broadcast();
  logger.info("Session reset");
  res.json(getStats());
});

(async () => {
  const SQL = await initSqlJs({
    locateFile: (file) =>
      path.join(__dirname, "..", "node_modules", "sql.js", "dist", file),
  });
  db = fs.existsSync(dbPath)
    ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)))
    : new SQL.Database();
  db.run(
    "CREATE TABLE IF NOT EXISTS session_stats (id INTEGER PRIMARY KEY, raids INTEGER NOT NULL DEFAULT 0, extracted INTEGER NOT NULL DEFAULT 0, failed INTEGER NOT NULL DEFAULT 0, kills INTEGER NOT NULL DEFAULT 0, gold INTEGER NOT NULL DEFAULT 0, red INTEGER NOT NULL DEFAULT 0, extracted_value INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  );
  db.run("INSERT OR IGNORE INTO session_stats (id) VALUES (1)");
  save();
  app.listen(PORT, () => {
    logger.info(`ABI overlay running at http://localhost:${PORT}`);
    logger.info(`Control panel: http://localhost:${PORT}/control`);
    logger.info(`OBS overlay:  http://localhost:${PORT}/overlay`);
  });
})().catch((error) => {
  logger.error(error);
  process.exitCode = 1;
});
