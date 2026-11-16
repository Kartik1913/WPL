require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const IrrigationRecord = require("./models/IrrigationRecord");
const { generateAdvisory } = require("./services/advisory");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/SugarcaneIrrigationDB";

const app = express();

// ---------- Middleware ----------
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {                       // simple request logger
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

// ---------- Helpers ----------
const FIELDS = ["farmerName", "farmerId", "plotId", "plotArea", "soilMoisture", "soilType",
  "cropStage", "temperature", "humidity", "expectedRainfall", "lastIrrigationDate"];

// Whitelist the input fields; reject objects/arrays (blocks operator injection such as {"$gt": ""})
function pickFields(body) {
  const out = {};
  for (const f of FIELDS) {
    const v = body[f];
    if (v === undefined) continue;
    if (v !== null && typeof v === "object") {
      const err = new Error(`Invalid value for ${f}`);
      err.status = 400;
      throw err;
    }
    out[f] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid record ID" });
  }
  next();
}

// ---------- REST API ----------
// READ all
app.get("/api/records", asyncHandler(async (req, res) => {
  res.json(await IrrigationRecord.find().sort({ createdAt: -1 }));
}));

// READ one
app.get("/api/records/:id", checkId, asyncHandler(async (req, res) => {
  const record = await IrrigationRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ error: "Record not found" });
  res.json(record);
}));

// Advisory preview (does not save anything)
app.post("/api/advisory/preview", asyncHandler(async (req, res) => {
  const doc = new IrrigationRecord(pickFields(req.body));
  await doc.validate();
  res.json(generateAdvisory(doc));
}));

// CREATE
app.post("/api/records", asyncHandler(async (req, res) => {
  const doc = new IrrigationRecord(pickFields(req.body));
  await doc.validate();
  Object.assign(doc, generateAdvisory(doc));
  const saved = await doc.save();
  res.status(201).json(saved);
}));

// UPDATE
app.put("/api/records/:id", checkId, asyncHandler(async (req, res) => {
  const record = await IrrigationRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ error: "Record not found" });
  record.set(pickFields(req.body));
  await record.validate();
  Object.assign(record, generateAdvisory(record));   // recompute advisory
  res.json(await record.save());
}));

// DELETE
app.delete("/api/records/:id", checkId, asyncHandler(async (req, res) => {
  const deleted = await IrrigationRecord.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Record not found" });
  res.json({ message: "Record deleted successfully", id: deleted._id });
}));

// ---------- Error handling ----------
app.use("/api", (req, res) => res.status(404).json({ error: "API route not found" }));

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: "Validation failed", details });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Validation failed", details: ["Plot ID already exists"] });
  }
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Validation failed",
      details: [`Invalid value for ${err.path}`]
    });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body" });
  }
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : "Internal server error" });
});

// ---------- Start ----------
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected: " + MONGODB_URI);
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
