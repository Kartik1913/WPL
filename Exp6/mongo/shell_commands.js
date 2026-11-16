// Paste these commands into mongosh one at a time (cursor results are only printed interactively).
// Run them on freshly seeded data (npm run seed). Shell updates do NOT recompute the advisory fields;
// only the Express PUT route does.
use SugarcaneIrrigationDB

db.irrigationrecords.countDocuments()

db.irrigationrecords.find(
  { soilType: "Black cotton" },
  { _id: 0, farmerName: 1, plotId: 1, soilMoisture: 1 }
)

db.irrigationrecords.find(
  { soilMoisture: { $lt: 35 } },
  { _id: 0, plotId: 1, soilMoisture: 1 }
)

db.irrigationrecords.find(
  { plotArea: { $gte: 2, $lte: 3.5 } },
  { _id: 0, plotId: 1, plotArea: 1 }
)

db.irrigationrecords.find(
  { cropStage: { $in: ["Germination", "Tillering"] } },
  { _id: 0, plotId: 1, cropStage: 1 }
)

db.irrigationrecords.find(
  { $or: [{ advisoryLevel: "URGENT" }, { expectedRainfall: { $gte: 20 } }] },
  { _id: 0, plotId: 1, advisoryLevel: 1, expectedRainfall: 1 }
)

db.irrigationrecords.find(
  { $and: [{ temperature: { $gt: 33 } }, { humidity: { $lt: 50 } }] },
  { _id: 0, plotId: 1, temperature: 1, humidity: 1 }
)

db.irrigationrecords.find({}, { _id: 0, plotId: 1, soilMoisture: 1 })
  .sort({ soilMoisture: 1 })
  .limit(3)

db.irrigationrecords.updateOne(
  { plotId: "PLT-1002" },
  { $set: { soilMoisture: 62, lastIrrigationDate: new Date("2026-11-15") } }
)

db.irrigationrecords.updateMany(
  { cropStage: "Maturity" },
  { $set: { expectedRainfall: 0 } }
)

db.irrigationrecords.deleteOne({ plotId: "PLT-1006" })

db.irrigationrecords.countDocuments()
