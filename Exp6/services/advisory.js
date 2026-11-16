// DEMONSTRATION-ONLY rule-based irrigation advisory.
// NOT a trained AI/ML model. The thresholds below are arbitrary classroom values:
// they are NOT scientifically validated and must not be used for real irrigation decisions.

const SOIL_TYPES = ["Black cotton", "Red soil", "Sandy loam", "Clay loam"];
const CROP_STAGES = ["Germination", "Tillering", "Grand Growth", "Maturity"];
const ADVISORY_LEVELS = ["URGENT", "IRRIGATE_SOON", "MONITOR", "NOT_REQUIRED", "HOLD_RAIN"];

// Minimum soil-moisture (%) the crop stage should stay above
const STAGE_THRESHOLD = { "Germination": 60, "Tillering": 55, "Grand Growth": 60, "Maturity": 35 };
// Soil adjustment: sandy soil drains fast (needs a higher target), heavy soil holds water
const SOIL_ADJUSTMENT = { "Sandy loam": 5, "Red soil": 0, "Clay loam": -3, "Black cotton": -5 };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(fromDate, toDate) {
  return Math.max(0, Math.floor((toDate - new Date(fromDate)) / MS_PER_DAY));
}

function generateAdvisory(rec, today = new Date()) {
  const target = STAGE_THRESHOLD[rec.cropStage] + SOIL_ADJUSTMENT[rec.soilType];
  const days = daysBetween(rec.lastIrrigationDate, today);
  const rain = Number(rec.expectedRainfall);
  const moisture = Number(rec.soilMoisture);
  const reasoning = [
    `Target minimum moisture for ${rec.cropStage} on ${rec.soilType} = ${target}%`,
    `Measured soil moisture = ${moisture}%`,
    `Expected rainfall = ${rain} mm; days since last irrigation = ${days}`
  ];
  const partialRain = rain >= 5 && rain < 20;
  const factor = partialRain ? 0.5 : 1;
  let level, recommendation;

  if (rain >= 20) {
    level = "HOLD_RAIN";
    recommendation =
      "Rainfall is expected; irrigation is not required today. Re-check moisture after the rain.";
    reasoning.push("Rule 1: expected rainfall >= 20 mm, so irrigation is postponed");
  } else if (moisture < target - 15) {
    level = "URGENT";
    recommendation =
      `Irrigate immediately (within 6 hours). Demo pump run: ${3 * factor} h per acre.`;
    reasoning.push("Rule 2: moisture is more than 15 points below the target");
  } else if (moisture < target) {
    level = "IRRIGATE_SOON";
    recommendation = `Irrigate within 24 hours. Demo pump run: ${2 * factor} h per acre.`;
    reasoning.push("Rule 3: moisture is below the target by 15 points or less");
  } else if (days >= 14 && moisture < target + 10) {
    level = "MONITOR";
    recommendation =
      "Moisture is adequate but irrigation was 14+ days ago; re-check the plot within 2 days.";
    reasoning.push("Rule 4: long gap since last irrigation and moisture close to target");
  } else if (Number(rec.temperature) >= 35 && Number(rec.humidity) < 40) {
    level = "MONITOR";
    recommendation = "Moisture is adequate, but hot and dry weather raises water loss; monitor daily.";
    reasoning.push("Rule 5: temperature >= 35 C and humidity < 40% (high evaporative demand)");
  } else {
    level = "NOT_REQUIRED";
    recommendation = "No irrigation needed now. Moisture is at or above the target.";
    reasoning.push("Rule 6: no rule triggered; moisture meets the target");
  }
  if (partialRain && (level === "URGENT" || level === "IRRIGATE_SOON")) {
    reasoning.push("Adjustment: rainfall of 5-20 mm expected, so the demo pump run is halved");
  }
  return { advisoryLevel: level, recommendation, reasoning };
}

module.exports = { generateAdvisory, SOIL_TYPES, CROP_STAGES, ADVISORY_LEVELS };
