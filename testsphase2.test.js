const request = require('supertest');
const app = require('../server/server');
const pool = require('../server/db/index');
const { runSeed } = require('../server/db/seed');

describe('Phase 2: Public Catalog & Envelope Integrity', () => {
    beforeAll(async () => await runSeed());
    afterAll(async () => await pool.end());

    it('GET /api/v1/products conforms to strict contract', async () => {
        const res = await request(app)
            .get('/api/v1/products')
            .expect('Content-Type', /json/)
            .expect(200);
            
        expect(typeof res.body.success).toBe('boolean');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.error).toBeNull();
    });
});