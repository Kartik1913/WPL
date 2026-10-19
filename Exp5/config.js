// config.js - one place for ports, database URI and irrigation thresholds.
// Every file (httpserver.js, filedemo.js, usemath.js, app.js) reads its settings from here,
// so the advice rules stay identical everywhere.

const HTTP_PORT = Number(process.env.HTTP_PORT) || 3000;      // httpserver.js
const EXPRESS_PORT = Number(process.env.PORT) || 3001;        // app.js
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sugarcanedb';

// DEMONSTRATION thresholds for soil humidity (%).
// Observed range in the supplied dataset: 10.04 - 39.95.
//   humidity <  irrigateBelow                     -> "Irrigate now"
//   irrigateBelow <= humidity < noIrrigationFrom  -> "Monitor soil"
//   humidity >= noIrrigationFrom                  -> "No irrigation needed"
// These are NOT validated agronomic recommendations. They are chosen so the rules
// reproduce the irrigation_advice labels already present in the dataset.
// They can be overridden with environment variables for experiments.
const THRESHOLDS = {
  irrigateBelow: Number(process.env.IRRIGATE_BELOW) || 20,
  noIrrigationFrom: Number(process.env.NO_IRRIGATION_FROM) || 30
};

if (!(THRESHOLDS.irrigateBelow < THRESHOLDS.noIrrigationFrom)) {
  throw new Error('IRRIGATE_BELOW must be smaller than NO_IRRIGATION_FROM');
}

const ADVICE = {
  IRRIGATE: 'Irrigate now',
  MONITOR: 'Monitor soil',
  NONE: 'No irrigation needed'
};

module.exports = { HTTP_PORT, EXPRESS_PORT, MONGO_URI, THRESHOLDS, ADVICE };
