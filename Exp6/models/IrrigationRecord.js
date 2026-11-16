const mongoose = require("mongoose");
const { SOIL_TYPES, CROP_STAGES, ADVISORY_LEVELS } = require("../services/advisory");

const num = (label, min, max) => ({
  type: Number,
  required: [true, `${label} is required`],
  min: [min, `${label} must be at least ${min}`],
  max: [max, `${label} must not exceed ${max}`]
});

const irrigationRecordSchema = new mongoose.Schema(
  {
    farmerName: {
      type: String, required: [true, "Farmer name is required"], trim: true,
      minlength: [2, "Farmer name must have at least 2 characters"],
      maxlength: [60, "Farmer name must not exceed 60 characters"]
    },
    farmerId: {
      type: String, required: [true, "Farmer ID is required"], trim: true, uppercase: true,
      match: [/^FRM-\d{3,6}$/, "Farmer ID must look like FRM-101"]
    },
    plotId: {
      type: String, required: [true, "Plot ID is required"], trim: true, uppercase: true, unique: true,
      match: [/^PLT-\d{3,6}$/, "Plot ID must look like PLT-1001"]
    },
    plotArea: num("Plot area (acres)", 0.1, 500),
    soilMoisture: num("Soil moisture (%)", 0, 100),
    soilType: {
      type: String, required: [true, "Soil type is required"],
      enum: { values: SOIL_TYPES, message: "Invalid soil type" }
    },
    cropStage: {
      type: String, required: [true, "Crop growth stage is required"],
      enum: { values: CROP_STAGES, message: "Invalid crop growth stage" }
    },
    temperature: num("Temperature (C)", -5, 60),
    humidity: num("Humidity (%)", 0, 100),
    expectedRainfall: num("Expected rainfall (mm)", 0, 500),
    lastIrrigationDate: {
      type: Date, required: [true, "Last irrigation date is required"],
      validate: {
        validator: (v) => v <= new Date(),
        message: "Last irrigation date cannot be in the future"
      }
    },
    // Computed by services/advisory.js on every create/update
    advisoryLevel: { type: String, enum: ADVISORY_LEVELS },
    recommendation: { type: String },
    reasoning: { type: [String], default: [] }
  },
  { timestamps: true, collection: "irrigationrecords" }
);

module.exports = mongoose.model("IrrigationRecord", irrigationRecordSchema);
