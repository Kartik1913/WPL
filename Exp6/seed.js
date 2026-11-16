// Loads clearly fictional sample data. Usage: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const IrrigationRecord = require("./models/IrrigationRecord");
const { generateAdvisory } = require("./services/advisory");

// farmerName, farmerId, plotId, plotArea, soilMoisture, soilType, cropStage,
// temperature, humidity, expectedRainfall, lastIrrigationDate
const samples = [
  ["Anil Jadhav", "FRM-101", "PLT-1001",
    2.5, 22, "Black cotton", "Grand Growth",
    34, 48, 0, "2026-11-01"],
  ["Savita Naik", "FRM-102", "PLT-1002",
    1.8, 41, "Red soil", "Tillering",
    31, 62, 2, "2026-11-08"],
  ["Prakash Desai", "FRM-103", "PLT-1003",
    4.0, 58, "Clay loam", "Grand Growth",
    29, 71, 25, "2026-11-10"],
  ["Meena Shinde", "FRM-104", "PLT-1004",
    3.2, 30, "Sandy loam", "Germination",
    36, 35, 0, "2026-10-28"],
  ["Sunil Patankar", "FRM-105", "PLT-1005",
    1.2, 38, "Red soil", "Maturity",
    30, 55, 4, "2026-11-05"],
  ["Kavita More", "FRM-106", "PLT-1006",
    2.0, 55, "Black cotton", "Tillering",
    37, 33, 0, "2026-11-01"]
];
const keys = ["farmerName", "farmerId", "plotId", "plotArea", "soilMoisture", "soilType",
  "cropStage", "temperature", "humidity", "expectedRainfall", "lastIrrigationDate"];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/SugarcaneIrrigationDB");
  await IrrigationRecord.deleteMany({});
  for (const row of samples) {
    const doc = new IrrigationRecord(Object.fromEntries(keys.map((k, i) => [k, row[i]])));
    Object.assign(doc, generateAdvisory(doc));
    await doc.save();
  }
  console.log(`Seeded ${samples.length} records`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
