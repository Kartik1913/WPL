// math.js - reusable custom module: basic statistics + threshold-based irrigation advice.
const { THRESHOLDS, ADVICE } = require('./config');

function assertNumbers(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('Expected a non-empty array of numbers');
  }
  for (const v of values) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new TypeError('All values must be finite numbers, got: ' + v);
    }
  }
}

function sum(values) {
  assertNumbers(values);
  return values.reduce((total, v) => total + v, 0);
}

function average(values) {
  return sum(values) / values.length;
}

function minimum(values) {
  assertNumbers(values);
  return values.reduce((lowest, v) => (v < lowest ? v : lowest), values[0]);
}

function maximum(values) {
  assertNumbers(values);
  return values.reduce((highest, v) => (v > highest ? v : highest), values[0]);
}

function round(value, places = 2) {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

// Threshold-based irrigation advice from soil humidity (%).
// This is a simple rule, not a trained AI/ML model.
function getAdvice(soilHumidity, thresholds = THRESHOLDS) {
  if (typeof soilHumidity !== 'number' || !Number.isFinite(soilHumidity)) {
    throw new TypeError('Soil humidity must be a finite number');
  }
  if (soilHumidity < 0 || soilHumidity > 100) {
    throw new RangeError('Soil humidity must be between 0 and 100 (%)');
  }
  if (soilHumidity < thresholds.irrigateBelow) return ADVICE.IRRIGATE;
  if (soilHumidity < thresholds.noIrrigationFrom) return ADVICE.MONITOR;
  return ADVICE.NONE;
}

module.exports = { sum, average, minimum, maximum, round, getAdvice };
