const request = require('supertest');
const app = require('../server/server');
const pool = require('../server/db/index');
const { runSeed } = require('../server/db/seed');

describe('Phase 2: Public Catalog & Envelope Integrity', () => {
    beforeAll(async () => await runSeed());
    afterAll(async () => await pool.end());

    it('GET /api/v1/products conforms to strict contract and filters inactive', async () => {
        // Manually set one product to inactive to test filtering
        await pool.query('UPDATE products SET is_active = false WHERE id = 1');

        const res = await request(app)
            .get('/api/v1/products')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(typeof res.body.success).toBe('boolean');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.error).toBeNull();

        // Assert no inactive products are returned
        const allActive = res.body.data.every(p => p.is_active !== false);
        expect(allActive).toBe(true);
    });

    it('GET /api/v1/products/:id returns a single product envelope', async () => {
        const res = await request(app)
            .get('/api/v1/products/2')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id', 2);
        expect(res.body.error).toBeNull();
    });
});
