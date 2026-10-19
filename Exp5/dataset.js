// dataset.js - reads the supplied Excel dataset with the xlsx package.
const path = require('path');
const XLSX = require('xlsx');

const DATASET_PATH = process.env.DATASET_PATH ||
  path.join(__dirname, 'data', 'sugarcane_irrigation_demo_dataset.xlsx');

// Returns an array of row objects; keys are the column names of the first sheet.
function loadDataset(file = DATASET_PATH) {
  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

module.exports = { loadDataset, DATASET_PATH };
