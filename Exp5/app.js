// app.js - Express.js application (default port 5000)
//
// Routes
//   GET    /                    static page          (public/index.html via express.static)
//   GET    /hello               basic Express route
//   GET    /dashboard           dynamic EJS dashboard (views/dashboard.ejs)
//   GET    /api/summary         dataset statistics (JSON)
//   GET    /api/advice?humidity=22.5   irrigation advice for one reading (JSON)
//   GET    /seed[?limit=N]      reset the "records" collection and import rows from Excel
//   GET    /api/records         list records (?page=&limit=&stage=&season=&advice=)
//   GET    /api/records/:id     one record by MongoDB _id
//   POST   /api/records         create a record
//   PUT    /api/records/:id     update fields of a record
//   DELETE /api/records/:id     delete a record
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const { EXPRESS_PORT, MONGO_URI, THRESHOLDS } = require('./config');
const mymath = require('./math');
const { loadDataset } = require('./dataset');
const { buildSummary } = require('./summary');
const Record = require('./models/Record');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.set('json spaces', 2);                                      // pretty-print JSON responses
app.use(express.json());                                        // parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public')));        // static files

// ---------- Dataset (read once from Excel at start-up) ----------
let rows = [];
try {
  rows = loadDataset();
  console.log('Excel rows read: ' + rows.length);
} catch (err) {
  console.error('Could not read the Excel dataset: ' + err.message);
  console.error('Place sugarcane_irrigation_demo_dataset.xlsx inside the data/ folder.');
}
const summary = rows.length ? buildSummary(rows, THRESHOLDS) : null;

// ---------- Basic routes ----------
app.get('/hello', (req, res) => {
  res.send('Hello from Express.js - Irrigation Advisory System for Sugarcane (KJS-AGR-01)');
});

// Representative records for the dashboard: first three rows of each advice class.
function sampleRecords() {
  const picked = [];
  for (const label of ['Irrigate now', 'Monitor soil', 'No irrigation needed']) {
    picked.push(...rows.filter(r => mymath.getAdvice(r.soilhumidity) === label).slice(0, 3));
  }
  return picked.map(r => ({ ...r, ruleAdvice: mymath.getAdvice(r.soilhumidity) }));
}

app.get('/dashboard', (req, res) => {
  if (!summary) return res.status(500).send('Dataset not loaded');
  res.render('dashboard', { summary, samples: sampleRecords(), mongoUp: mongoose.connection.readyState === 1 });
});

app.get('/api/summary', (req, res) => {
  if (!summary) return res.status(500).json({ error: 'Dataset not loaded' });
  const { _adviceLabels, ...publicSummary } = summary;
  res.json(publicSummary);
});

app.get('/api/advice', (req, res) => {
  const h = Number(req.query.humidity);
  if (req.query.humidity === undefined || req.query.humidity === '' || !Number.isFinite(h)) {
    return res.status(400).json({ error: 'Query parameter "humidity" (number, 0-100) is required' });
  }
  try {
    res.json({ soilHumidity: h, advice: mymath.getAdvice(h), thresholds: THRESHOLDS });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Database helpers ----------
const ID_PATTERN = /^[0-9a-fA-F]{24}$/;

function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected. Start MongoDB and restart the app.' });
  }
  next();
}

function requireValidId(req, res, next) {
  if (!ID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid record id: "' + req.params.id + '"' });
  }
  next();
}

function requireBodyObject(req, res, next) {
  const b = req.body;
  if (!b || typeof b !== 'object' || Array.isArray(b) || Object.keys(b).length === 0) {
    return res.status(400).json({ error: 'Request body must be a non-empty JSON object' });
  }
  next();
}

// Remove fields the client must never set.
function cleanBody(body) {
  const { _id, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
}

// ---------- Seeding ----------
app.get('/seed', requireDb, async (req, res, next) => {
  try {
    if (!rows.length) return res.status(500).json({ error: 'Dataset not loaded' });
    let limit = rows.length;
    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > rows.length) {
        return res.status(400).json({ error: 'limit must be an integer between 1 and ' + rows.length });
      }
    }
    await Record.deleteMany({});
    const inserted = await Record.insertMany(rows.slice(0, limit));
    res.json({ message: 'Collection reset and seeded from the Excel dataset', inserted: inserted.length });
  } catch (err) { next(err); }
});

// ---------- CRUD on /api/records ----------
app.get('/api/records', requireDb, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
    const filter = {};
    if (req.query.stage) filter.stages = String(req.query.stage);
    if (req.query.season) filter.microclimaticseason = String(req.query.season);
    if (req.query.advice) filter.irrigation_advice = String(req.query.advice);

    const [total, data] = await Promise.all([
      Record.countDocuments(filter),
      Record.find(filter).sort({ _id: 1 }).skip((page - 1) * limit).limit(limit)
    ]);
    res.json({ total, page, limit, count: data.length, data });
  } catch (err) { next(err); }
});

app.get('/api/records/:id', requireDb, requireValidId, async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) { next(err); }
});

app.post('/api/records', requireDb, requireBodyObject, async (req, res, next) => {
  try {
    const data = cleanBody(req.body);
    // If advice is not supplied, derive it with the same rule used everywhere else.
    if (data.irrigation_advice === undefined && typeof data.soilhumidity === 'number') {
      try { data.irrigation_advice = mymath.getAdvice(data.soilhumidity); } catch (e) { /* schema validation reports it */ }
    }
    const created = await Record.create(data);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/records/:id', requireDb, requireValidId, requireBodyObject, async (req, res, next) => {
  try {
    const changes = cleanBody(req.body);
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No updatable fields supplied' });
    }
    if (changes.soilhumidity !== undefined && changes.irrigation_advice === undefined &&
        typeof changes.soilhumidity === 'number') {
      try { changes.irrigation_advice = mymath.getAdvice(changes.soilhumidity); } catch (e) { /* validation reports it */ }
    }
    const updated = await Record.findByIdAndUpdate(req.params.id, { $set: changes },
      { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/records/:id', requireDb, requireValidId, async (req, res, next) => {
  try {
    const deleted = await Record.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted', id: req.params.id, leaf: deleted.leaf });
  } catch (err) { next(err); }
});

// ---------- 404 and error handling ----------
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Route not found' });
  res.status(404).send('<h1>404 Page Not Found</h1>');
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid value for field "' + err.path + '"' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', details: err.keyValue });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------- Start ----------
app.listen(EXPRESS_PORT, () => {
  console.log('Express running at http://localhost:' + EXPRESS_PORT);
});

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB connected: ' + MONGO_URI))
  .catch(err => {
    console.error('MongoDB connection failed: ' + err.message);
    console.error('The dashboard and /api/summary still work; /api/records and /seed need MongoDB.');
  });
