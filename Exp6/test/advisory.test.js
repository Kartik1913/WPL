// Dependency-free test of the rule engine. Run: npm test
const assert = require("assert");
const { generateAdvisory } = require("../services/advisory");
const today = new Date("2026-11-15");
const base = { farmerName: "T", soilMoisture: 50, soilType: "Red soil", cropStage: "Tillering",
  temperature: 30, humidity: 60, expectedRainfall: 0, lastIrrigationDate: "2026-11-10" };
const lv = (o) => generateAdvisory({ ...base, ...o }, today).advisoryLevel;

assert.strictEqual(lv({ expectedRainfall: 25 }), "HOLD_RAIN");
assert.strictEqual(lv({ soilMoisture: 30 }), "URGENT");          // target 55, 30 < 40
assert.strictEqual(lv({ soilMoisture: 50 }), "IRRIGATE_SOON");   // 40 <= 50 < 55
assert.strictEqual(lv({ soilMoisture: 70 }), "NOT_REQUIRED");
assert.strictEqual(lv({ soilMoisture: 60, lastIrrigationDate: "2026-10-30" }), "MONITOR");
assert.strictEqual(lv({ soilMoisture: 70, temperature: 38, humidity: 30 }), "MONITOR");
const partial = generateAdvisory({ ...base, soilMoisture: 30, expectedRainfall: 10 }, today);
assert.ok(partial.recommendation.includes("1.5 h"));   // pump run halved for 5-20 mm rain
console.log("All 7 advisory rule tests passed");
