// summary.js - computes dataset statistics from the real rows (nothing is hard-coded).
const mymath = require('./math');
const { ADVICE } = require('./config');

function countBy(rows, key) {
  const out = {};
  for (const r of rows) out[r[key]] = (out[r[key]] || 0) + 1;
  return out;
}

function buildSummary(rows, thresholds) {
  const humidity = rows.map(r => r.soilhumidity);
  const ruleAdvice = rows.map(r => mymath.getAdvice(r.soilhumidity, thresholds));
  const ruleCounts = {};
  for (const a of ruleAdvice) ruleCounts[a] = (ruleCounts[a] || 0) + 1;
  const matches = rows.filter((r, i) => r.irrigation_advice === ruleAdvice[i]).length;

  return {
    records: rows.length,
    columns: rows.length ? Object.keys(rows[0]).length : 0,
    columnNames: rows.length ? Object.keys(rows[0]) : [],
    soilHumidity: {
      sum: mymath.round(mymath.sum(humidity)),
      average: mymath.round(mymath.average(humidity)),
      min: mymath.minimum(humidity),
      max: mymath.maximum(humidity)
    },
    thresholds,
    adviceByRule: ruleCounts,
    adviceInDataset: countBy(rows, 'irrigation_advice'),
    ruleMatchesDatasetLabels: { matching: matches, total: rows.length },
    byStage: countBy(rows, 'stages'),
    bySeason: countBy(rows, 'microclimaticseason'),
    averagePredictedYield: mymath.round(mymath.average(rows.map(r => r.predicted_yield))),
    averageWaterLitersPerDay: mymath.round(mymath.average(rows.map(r => r.predicted_water_liters_per_day))),
    note: 'Thresholds are demonstration values, not validated agronomic recommendations. ' +
      'Advice is rule-based; no AI/ML model is trained in this experiment.',
    _adviceLabels: Object.values(ADVICE)
  };
}

module.exports = { buildSummary };
