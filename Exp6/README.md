# Sugarcane Smart Irrigation Advisory System (KJS-AGR-01)

WPL Experiment 6: Integration of MongoDB/Mongoose with Node.js and Express.js.

A small full-stack prototype: farmer and plot data is stored in MongoDB through Mongoose,
exposed by an Express REST API, and managed from a vanilla HTML/CSS/JS page.
The irrigation advisory is a **demonstration-only rule-based engine** (`services/advisory.js`).
It is not a trained AI/ML model, its thresholds are arbitrary classroom values that are NOT
scientifically validated, and there is no real sensor or weather-API connection.
All sample farmers and plots are fictional.

## Prerequisites
- Node.js 18+ and npm
- MongoDB Community Server (running locally) and, optionally, MongoDB Compass / mongosh

## Setup
```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

## Start MongoDB
```bash
# Linux / macOS
mongod --dbpath ./data      # create the folder first: mkdir data
# Windows: start the "MongoDB Server" service, or run mongod.exe
```
Default connection: `mongodb://127.0.0.1:27017/SugarcaneIrrigationDB`

## Run
```bash
npm run seed    # optional: load 6 fictional sample records
npm start       # http://localhost:3000
npm test        # runs the dependency-free rule-engine tests
```

## MongoDB shell practice
```bash
mongosh
# then paste the commands from mongo/shell_commands.js one at a time
# (run them on freshly seeded data: npm run seed)
```

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/records | List all records |
| GET | /api/records/:id | Get one record |
| POST | /api/records | Create (advisory computed) |
| PUT | /api/records/:id | Update (advisory recomputed) |
| DELETE | /api/records/:id | Delete |
| POST | /api/advisory/preview | Advisory without saving |

## Testing CRUD with curl
```bash
# CREATE
curl -X POST http://localhost:3000/api/records -H "Content-Type: application/json" -d '{"farmerName":"Test Farmer","farmerId":"FRM-201","plotId":"PLT-2001","plotArea":2,"soilMoisture":30,"soilType":"Red soil","cropStage":"Tillering","temperature":32,"humidity":55,"expectedRainfall":0,"lastIrrigationDate":"2026-11-10"}'
# READ
curl http://localhost:3000/api/records
# UPDATE (replace <id> with the _id from above)
curl -X PUT http://localhost:3000/api/records/<id> -H "Content-Type: application/json" -d '{"soilMoisture":58}'
# DELETE
curl -X DELETE http://localhost:3000/api/records/<id>
# VALIDATION ERROR (expect HTTP 400)
curl -X POST http://localhost:3000/api/records -H "Content-Type: application/json" -d '{"farmerName":"A"}'
```
Or test everything from the browser UI at http://localhost:3000.

## Advisory rules (demonstration only, not validated)
Target moisture = stage value (Germination 60, Tillering 55, Grand Growth 60, Maturity 35)
+ soil adjustment (Sandy loam +5, Red 0, Clay loam -3, Black cotton -5).
1. Rain >= 20 mm: hold irrigation. 2. Moisture < target-15: urgent.
3. Moisture < target: irrigate soon. 4. 14+ days since irrigation and moisture < target+10: monitor.
5. Temperature >= 35 C and humidity < 40%: monitor. 6. Otherwise: not required.
Rain of 5-20 mm halves the demo pump run.

## Verification status
Verified by the author of this package: JavaScript syntax (`node --check`) and the rule-engine tests (`npm test`).
NOT verified: running the server against MongoDB, the REST API and the browser UI. Run the steps above
and check them yourself before claiming they work.

Note: the advisory for the seeded records depends on the date you run `npm run seed` (rule 4 uses days since irrigation).
