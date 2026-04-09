# 📋 THE DAG & CI PIPELINE

## Phase 0: CI Harness Setup (DO THIS FIRST)
* [ ] Initialize `npm` and create `.env` with `DATABASE_URL=postgres://localhost:5432/minishop_test` and `JWT_SECRET=testsecret`.
* [ ] `npm install express pg cors morgan dotenv bcrypt jsonwebtoken`.
* [ ] `npm install --save-dev jest supertest`.
* [ ] Add to `package.json` scripts:
  * `"test:phase1": "jest tests/phase1.test.js --runInBand"`
  * `"test:phase2": "jest tests/phase2.test.js --runInBand"`
  * `"test:phase3": "jest tests/phase3.test.js --runInBand"`
  * `"test:phase4": "jest tests/phase4.test.js --runInBand"`
* [ ] Scaffold the directory structure and extract the files from `03-TEST-SUITE.md` into the `tests/` folder.
* **GIT:** `git add . && git commit -m "chore: setup CI harness"`

## Phase 1: Database & Deterministic Seeding
* [ ] Write `server/db/schema.sql`.
* [ ] Write `server/db/index.js` exporting the pg pool.
* [ ] Write `server/db/seed.js`. Export an async `runSeed()` function that truncates tables, hashes 'admin123', and inserts the user (`admin@minishop.com`) and 5 products.
* **CI GATE:** Run `npm run test:phase1`.
* **GIT:** Commit upon green.

## Phase 2: Public Catalog & Envelope Integrity
* [ ] Write `server/server.js` (Export the app, do NOT call listen). Write `server/index.js` (Calls listen).
* [ ] Write product routes and controllers. Mount in `server.js`.
* **CI GATE:** Run `npm run test:phase2`.
* **GIT:** Commit upon green.

## Phase 3: The Critical Path (True Concurrency)
* [ ] Write `server/routes/order.routes.js` and mount it in `server.js`.
* [ ] Write `server/controllers/order.controller.js`. You MUST use `BEGIN`, `SELECT ... FOR UPDATE`, check stock, and `COMMIT/ROLLBACK`.
* **CI GATE:** Run `npm run test:phase3`.
* **GIT:** Commit upon green.

## Phase 4: Frontend & Auth (Finalizing MVP)
* [ ] Write `server/controllers/auth.controller.js` and `server/routes/auth.routes.js`. Mount in `server.js`.
* [ ] Write `server/middleware/auth.middleware.js` to verify JWTs.
* [ ] Apply auth middleware to Protected Product CRUD routes.
* [ ] Build the Vanilla JS frontend (`client/`) referencing the API.
* **CI GATE:** Run `npm run test:phase4`.
* **GIT:** Commit upon green.
