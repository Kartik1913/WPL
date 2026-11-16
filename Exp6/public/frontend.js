const form = document.getElementById("recordForm");
const messageBox = document.getElementById("message");
const advisoryBox = document.getElementById("advisoryBox");
const tbody = document.getElementById("records");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const previewBtn = document.getElementById("previewBtn");

const FIELDS = ["farmerName", "farmerId", "plotId", "plotArea", "soilMoisture", "soilType",
  "cropStage", "temperature", "humidity", "expectedRainfall", "lastIrrigationDate"];
const LEVEL_LABEL = { URGENT: "Urgent", IRRIGATE_SOON: "Irrigate Soon", MONITOR: "Monitor",
  NOT_REQUIRED: "Not Required", HOLD_RAIN: "Hold - Rain" };

let editingId = null;
let records = [];

function showMessage(type, text, details) {
  messageBox.className = type;
  messageBox.textContent = text;
  if (details && details.length) {
    const ul = document.createElement("ul");
    details.forEach((d) => {
      const li = document.createElement("li");
      li.textContent = d;
      ul.appendChild(li);
    });
    messageBox.appendChild(ul);
  }
}

function readForm() {
  const data = {};
  FIELDS.forEach((f) => { data[f] = document.getElementById(f).value; });
  return data;
}

// Client-side validation (the server and Mongoose validate again)
function validateClient(d) {
  const errors = [];
  FIELDS.forEach((f) => { if (d[f] === "") errors.push(f + " is required"); });
  if (d.farmerId && !/^FRM-\d{3,6}$/i.test(d.farmerId)) errors.push("Farmer ID must look like FRM-101");
  if (d.plotId && !/^PLT-\d{3,6}$/i.test(d.plotId)) errors.push("Plot ID must look like PLT-1001");
  if (d.soilMoisture !== "" && (d.soilMoisture < 0 || d.soilMoisture > 100)) {
    errors.push("Soil moisture must be 0-100%");
  }
  if (d.humidity !== "" && (d.humidity < 0 || d.humidity > 100)) {
    errors.push("Humidity must be 0-100%");
  }
  return errors;
}

function showAdvisory(adv) {
  advisoryBox.hidden = false;
  advisoryBox.className = "advisory " + adv.advisoryLevel;
  advisoryBox.textContent = "";
  const h = document.createElement("h3");
  h.textContent = "Advisory: " + LEVEL_LABEL[adv.advisoryLevel];
  const p = document.createElement("p");
  p.textContent = adv.recommendation;
  const ul = document.createElement("ul");
  (adv.reasoning || []).forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    ul.appendChild(li);
  });
  const note = document.createElement("p");
  note.textContent = "Demonstration advisory only - thresholds are not scientifically validated.";
  note.style.fontSize = "12px";
  note.style.fontStyle = "italic";
  advisoryBox.append(h, p, ul, note);
}

async function api(url, options) {
  const res = await fetch(url, options);
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body.error || "Request failed");
    err.details = body.details;
    throw err;
  }
  return body;
}

function cell(tr, text) {
  const td = document.createElement("td");
  td.textContent = text;
  tr.appendChild(td);
  return td;
}

function renderRecords() {
  tbody.textContent = "";
  if (records.length === 0) {
    const tr = document.createElement("tr");
    const td = cell(tr, "No records saved yet.");
    td.colSpan = 13;
    tbody.appendChild(tr);
    return;
  }
  records.forEach((r) => {
    const tr = document.createElement("tr");
    const values = [r.farmerName, r.farmerId, r.plotId, r.plotArea, r.soilMoisture, r.soilType,
      r.cropStage, r.temperature, r.humidity, r.expectedRainfall,
      r.lastIrrigationDate.slice(0, 10)];
    values.forEach((v) => cell(tr, v));
    const adv = cell(tr, "");
    const badge = document.createElement("span");
    badge.className = "badge " + r.advisoryLevel;
    badge.textContent = LEVEL_LABEL[r.advisoryLevel] || "-";
    adv.appendChild(badge);
    const act = cell(tr, "");
    const edit = document.createElement("button");
    edit.className = "small secondary"; edit.textContent = "Edit";
    edit.addEventListener("click", () => startEdit(r._id));
    const del = document.createElement("button");
    del.className = "small danger"; del.textContent = "Delete";
    del.addEventListener("click", () => deleteRecord(r._id, r.plotId));
    act.append(edit, del);
    tbody.appendChild(tr);
  });
}

async function loadRecords() {
  try {
    records = await api("/api/records");
    renderRecords();
  } catch (err) {
    showMessage("error", "Could not load records: " + err.message);
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = "Farmer and Plot Information";
  saveBtn.textContent = "Save Record";
  cancelBtn.hidden = true;
}

function startEdit(id) {
  const r = records.find((x) => x._id === id);
  if (!r) return;
  FIELDS.forEach((f) => {
    document.getElementById(f).value = f === "lastIrrigationDate" ? r[f].slice(0, 10) : r[f];
  });
  editingId = id;
  formTitle.textContent = "Edit Record: " + r.plotId;
  saveBtn.textContent = "Update Record";
  cancelBtn.hidden = false;
  showAdvisory(r);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = readForm();
  const errors = validateClient(data);
  if (errors.length) { showMessage("error", "Please correct the following:", errors); return; }
  try {
    const url = editingId ? "/api/records/" + editingId : "/api/records";
    const saved = await api(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    showMessage("success", editingId ? "Record updated successfully!" : "Record saved successfully!");
    showAdvisory(saved);
    resetForm();
    await loadRecords();
  } catch (err) {
    showMessage("error", err.message, err.details);
  }
});

previewBtn.addEventListener("click", async () => {
  const data = readForm();
  const errors = validateClient(data);
  if (errors.length) { showMessage("error", "Please correct the following:", errors); return; }
  try {
    const adv = await api("/api/advisory/preview", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    showMessage("success", "Advisory generated (not saved).");
    showAdvisory(adv);
  } catch (err) {
    showMessage("error", err.message, err.details);
  }
});

cancelBtn.addEventListener("click", () => { resetForm(); showMessage("success", "Edit cancelled."); });

async function deleteRecord(id, plotId) {
  if (!confirm("Delete the record for plot " + plotId + "?")) return;
  try {
    await api("/api/records/" + id, { method: "DELETE" });
    showMessage("success", "Record deleted successfully!");
    if (editingId === id) resetForm();
    await loadRecords();
  } catch (err) {
    showMessage("error", err.message);
  }
}

loadRecords();
