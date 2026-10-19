# FSDL Experiment 5 - Node.js and Express.js (Use Case KJS-AGR-01)

Irrigation Advisory System for Sugarcane Crop - K. J. Somaiya College of Engineering, Mumbai
Course: Full Stack Development Laboratory (216U50L501), Semester V, CO5.

The project runs **locally only**. There is no cloud deployment, hosted link or online code link.
Irrigation advice is a **simple threshold rule on soil humidity**; no AI/ML model is trained.
The thresholds are demonstration values, not validated agronomic recommendations.

## 1. What must be installed separately

| Software | Version used | Notes |
|---|---|---|
| Node.js + npm | Node 20.19 or newer (built with v22.22.0) | https://nodejs.org (LTS). Check: `node -v`, `npm -v` |
| MongoDB Community Server | any current 7.x/8.x | https://www.mongodb.com/try/download/community - runs on `127.0.0.1:27017` |
| MongoDB Compass (optional) | - | GUI to see `sugarcanedb` > `records` |
| Thunder Client / Postman (optional) | - | to send POST / PUT / DELETE (or use `curl` / `npm run test:api`) |

MongoDB is only needed for `/seed` and `/api/records...`. Everything else works without it.

## 2. Setup

```bash
# unzip the project, then inside the project folder:
npm install            # installs express, mongoose, ejs, xlsx (versions in package.json)
```

Starting from an empty folder instead (what the lab steps describe):
```bash
mkdir EXP5 && cd EXP5
npm init -y
npm install express mongoose ejs xlsx
```
Then copy the project files in and place the dataset at
`data/sugarcane_irrigation_demo_dataset.xlsx` (already there in this ZIP).
A different location can be used with the `DATASET_PATH` environment variable.

Start MongoDB (Windows: it normally runs as a service after installation; check Services > MongoDB Server).
Linux/macOS: `mongod --dbpath <some empty folder>` or `sudo systemctl start mongod`.

## 3. Run commands

| Purpose | Command | Port |
|---|---|---|
| HTTP server demo (http module) | `node httpserver.js` (or `npm run http`) | 3000 |
| Callback + sync/async file demo | `node filedemo.js` (or `npm run files`) | - |
| Custom math module demo | `node usemath.js` (or `npm run math`) | - |
| Express application | `node app.js` (or `npm start`) | 5000 |
| API test script (needs app + MongoDB running) | `npm run test:api` | - |

Stop a server with `Ctrl + C`.

Open in a browser: http://localhost:5000/dashboard

## 4. Routes

### httpserver.js (http://localhost:3000)
| Method | URL | Response |
|---|---|---|
| GET | `/` | `home.html` |
| GET | `/data` | `data.json` (application/json) |
| any other GET | e.g. `/xyz` | 404 "404 Page Not Found" |
| non-GET | any | 405 |

### app.js (http://localhost:5000)
| Method | URL | Description |
|---|---|---|
| GET | `/` | static page `public/index.html` (express.static) |
| GET | `/style.css` | static stylesheet |
| GET | `/hello` | basic Express route (text) |
| GET | `/dashboard` | EJS dashboard: statistics, advice distribution, sample records |
| GET | `/api/summary` | dataset statistics computed from the Excel file (JSON) |
| GET | `/api/advice?humidity=22.5` | advice for one soil-humidity value |
| GET | `/seed` or `/seed?limit=100` | **deletes** the `records` collection, then imports rows from Excel |
| GET | `/api/records` | list; query `page`, `limit` (max 200), `stage`, `season`, `advice` |
| GET | `/api/records/:id` | one record by MongoDB `_id` |
| POST | `/api/records` | create (JSON body) -> 201 |
| PUT | `/api/records/:id` | update the supplied fields (partial update) |
| DELETE | `/api/records/:id` | delete |

Error handling: invalid id -> 400, valid but unknown id -> 404, malformed JSON / empty body /
validation errors -> 400, duplicate `leaf` -> 409, MongoDB not connected -> 503, anything else -> 500.
If `irrigation_advice` is not sent on POST (or `soilhumidity` is changed on PUT without it),
the advice is derived with the same rule as everywhere else.

### Example requests (curl; on Windows PowerShell use `curl.exe`, or use Thunder Client/Postman)
```bash
curl http://localhost:5000/seed
curl "http://localhost:5000/api/records?limit=3"
curl http://localhost:5000/api/records/<id>

curl -X POST http://localhost:5000/api/records -H "Content-Type: application/json" \
  -d '{"leaf":"leaf_my_1","stages":"tillering","microclimaticseason":"summer","soilhumidity":18.5}'

curl -X PUT http://localhost:5000/api/records/<id> -H "Content-Type: application/json" \
  -d '{"soilhumidity":33.2}'

curl -X DELETE http://localhost:5000/api/records/<id>
```
PowerShell users: quoting of `-d` JSON is awkward; Thunder Client/Postman or `npm run test:api` is easier.

## 5. Irrigation-advice rule (one rule, used everywhere)

Defined in `config.js`, implemented in `math.js` (`getAdvice`), and used by `httpserver.js` data,
`filedemo.js`, `usemath.js`, `/api/summary`, `/api/advice`, the dashboard and the CRUD routes.

| Soil humidity (%) | Advice |
|---|---|
| below 20 | Irrigate now |
| 20 to below 30 | Monitor soil |
| 30 or more | No irrigation needed |

The observed soil-humidity range in the supplied dataset is 10.04 - 39.95 (mean 25.02), and these two
cut-offs reproduce the `irrigation_advice` label of all 1500 rows. They can be changed with the
environment variables `IRRIGATE_BELOW` and `NO_IRRIGATION_FROM`.

## 6. Dataset

`data/sugarcane_irrigation_demo_dataset.xlsx` - one sheet (`SugarcaneData`), 1500 records, 18 columns:
leaf, stages, microclimaticseason, soilhumidity, leafhumidity, microclimatictemp, rainfall_mm,
evapotranspiration, nitrogen, phosphorus, potassium, soil_ph, soil_moisture_index, irrigation_advice,
predicted_water_liters_per_day, yield_kg_per_plant, yield_quintal_per_acre, predicted_yield.

## 7. Files

```
package.json  config.js  math.js  dataset.js  summary.js
httpserver.js home.html  data.json
filedemo.js   usemath.js            -> write logs/sync_log.txt and logs/async_log.txt
app.js        models/Record.js      views/dashboard.ejs
public/index.html  public/style.css
tests/api-test.js   data/sugarcane_irrigation_demo_dataset.xlsx
```

## 8. Notes
* The `xlsx` package from npm (0.18.5) reports known advisories in `npm audit`; this project only reads its own
  bundled Excel file and never parses uploaded files.
* Environment variables: `PORT` (5000), `HTTP_PORT` (3000), `MONGO_URI`
  (default `mongodb://127.0.0.1:27017/sugarcanedb`), `DATASET_PATH`.
