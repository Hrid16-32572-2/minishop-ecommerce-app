const request = require('supertest');
const app = require('../server/server');
const pool = require('../server/db/index');
const { runSeed } = require('../server/db/seed');

describe('Phase 3: Checkout Concurrency & Happy Path', () => {
    // FIX: Using beforeEach ensures pure state isolation for both happy path and concurrency
    beforeEach(async () => await runSeed());
    afterAll(async () => await pool.end());

    it('Happy Path: Valid checkout returns 201 and decrements stock', async () => {
        const payload = { items: [{ product_id: 1, quantity: 1 }] };
        const res = await request(app)
            .post('/api/v1/orders')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(res.body.success).toBe(true);

        // Assumes seed creates ID 1 with qty 10. Check if decremented to 9.
        const stockCheck = await pool.query('SELECT stock_quantity FROM products WHERE id = 1');
        expect(stockCheck.rows[0].stock_quantity).toBe(9);
    });

    it('Concurrency: Prevents overselling via row-level locks', async () => {
        await pool.query('UPDATE products SET stock_quantity = 1 WHERE id = 2');
        const payload = { items: [{ product_id: 2, quantity: 1 }] };

        const req1 = request(app).post('/api/v1/orders').send(payload);
        const req2 = request(app).post('/api/v1/orders').send(payload);
        const [res1, res2] = await Promise.all([req1, req2]);

        const statuses = [res1.status, res2.status].sort();
        expect(statuses).toEqual([201, 400]);

        const failedRes = res1.status === 400 ? res1 : res2;
        expect(failedRes.headers['content-type']).toMatch(/json/);
        expect(failedRes.body).toEqual({
            success: false,
            data: null,
            error: 'INSUFFICIENT_STOCK'
        });

        const stockCheck = await pool.query('SELECT stock_quantity FROM products WHERE id = 2');
        expect(stockCheck.rows[0].stock_quantity).toBe(0);
    });
});
const request = require('supertest');
const app = require('../server/server');
const pool = require('../server/db/index');
const { runSeed } = require('../server/db/seed');

describe('Phase 3: Checkout Concurrency & Happy Path', () => {
    // FIX: Using beforeEach ensures pure state isolation for both happy path and concurrency
    beforeEach(async () => await runSeed());
    afterAll(async () => await pool.end());

    it('Happy Path: Valid checkout returns 201 and decrements stock', async () => {
        const payload = { items: [{ product_id: 1, quantity: 1 }] };
        const res = await request(app)
            .post('/api/v1/orders')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(res.body.success).toBe(true);

        // Assumes seed creates ID 1 with qty 10. Check if decremented to 9.
        const stockCheck = await pool.query('SELECT stock_quantity FROM products WHERE id = 1');
        expect(stockCheck.rows[0].stock_quantity).toBe(9);
    });

    it('Concurrency: Prevents overselling via row-level locks', async () => {
        await pool.query('UPDATE products SET stock_quantity = 1 WHERE id = 2');
        const payload = { items: [{ product_id: 2, quantity: 1 }] };

        const req1 = request(app).post('/api/v1/orders').send(payload);
        const req2 = request(app).post('/api/v1/orders').send(payload);
        const [res1, res2] = await Promise.all([req1, req2]);

        const statuses = [res1.status, res2.status].sort();
        expect(statuses).toEqual([201, 400]);

        const failedRes = res1.status === 400 ? res1 : res2;
        expect(failedRes.headers['content-type']).toMatch(/json/);
        expect(failedRes.body).toEqual({
            success: false,
            data: null,
            error: 'INSUFFICIENT_STOCK'
        });

        const stockCheck = await pool.query('SELECT stock_quantity FROM products WHERE id = 2');
        expect(stockCheck.rows[0].stock_quantity).toBe(0);
    });
});
