// models/Record.js - Mongoose schema/model using the 18 columns of the dataset.
const mongoose = require('mongoose');

const num = (min, max) => {
  const o = { type: Number };
  if (min !== undefined) o.min = min;
  if (max !== undefined) o.max = max;
  return o;
};

const recordSchema = new mongoose.Schema({
  leaf: { type: String, required: true, unique: true, trim: true },
  stages: {
    type: String, required: true,
    enum: ['germination', 'tillering', 'grand_growth', 'maturity', 'drying']
  },
  microclimaticseason: { type: String, required: true, enum: ['summer', 'monsoon', 'winter'] },
  soilhumidity: { ...num(0, 100), required: true },
  leafhumidity: num(0, 100),
  microclimatictemp: num(),
  rainfall_mm: num(0),
  evapotranspiration: num(0),
  nitrogen: num(0),
  phosphorus: num(0),
  potassium: num(0),
  soil_ph: num(0, 14),
  soil_moisture_index: num(0, 1),
  irrigation_advice: {
    type: String, enum: ['Irrigate now', 'Monitor soil', 'No irrigation needed']
  },
  predicted_water_liters_per_day: num(0),
  yield_kg_per_plant: num(0),
  yield_quintal_per_acre: num(0),
  predicted_yield: num(0)
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema, 'records');
