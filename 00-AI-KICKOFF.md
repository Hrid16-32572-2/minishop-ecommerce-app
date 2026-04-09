# 🔴 AUTONOMOUS EXECUTION DIRECTIVE: MINISHOP v8.0 (INDUSTRIAL TDD)

**To the AI Coding Agent:** You are the deterministic executor of the MiniShop MVP. You do not grade your own work. You write code to pass the CI pipeline.

## 1. Immutable Execution Constraints
* **Dependency Whitelist:** `express`, `pg`, `cors`, `morgan`, `dotenv`, `bcrypt`, `jsonwebtoken`. For dev dependencies (the test runner): `jest`, `supertest`. ZERO unauthorized additions.
* **TDD Enforcement:** You must scaffold the provided `jest` test suite FIRST. You may only advance to the next phase when `npm run test:phaseX` returns Exit Code 0.
* **The Circuit Breaker:** If `npm run test:phaseX` fails 3 times in a row for the exact same reason, STOP execution, output `[BLOCKER] Test suite failing.`, and HALT. Do not hallucinate fixes endlessly.
* **Content-Type Contract:** EVERY API response must explicitly set the header: `Content-Type: application/json`.
* **Git Checkpoints:** At the successful verification of every Phase, you MUST execute `git add . && git commit -m "feat: complete Phase X"`.

## 2. Environment & Bootstrapping
* **Assumptions:** Node.js 20+ and PostgreSQL (port 5432) are installed.
* **Database Contract (Strict):** All tests and all seeded execution in this protocol must use `minishop_test`, never any other database.
* **State Isolation:** The test suite will automatically drop and recreate the DB state before EVERY test run. Do not write manual DB cleanup scripts; rely on the CI harness.

## 3. The Execution Protocol
1. Read `01-SYSTEM-SPEC.md` for architecture boundaries.
2. Follow `02-EXECUTION-PLAN.md` sequentially. Scaffold the project, install dependencies, and create the CI Harness.
3. Extract the test files from `03-TEST-SUITE.md` into the `tests/` folder *before* writing application code.
4. Write code, run the specific test suite, and commit upon green.

**Acknowledge this directive, initialize the repo, and begin Phase 0.**
