# CI TEST SUITE
Agent: Extract the following blocks into their respective files inside the `tests/` directory.

### File: `tests/phase1.test.js`
```javascript
const pool = require('../server/db/index');
const { runSeed } = require('../server/db/seed');

describe('Phase 1: DB & Idempotent Seeding', () => {
    beforeAll(async () => {
        await runSeed();
    });
    afterAll(async () => {
        await pool.end();
    });

    it('Should insert an admin with a valid bcrypt hash', async () => {
        const res = await pool.query("SELECT * FROM users WHERE email = 'admin@minishop.com'");
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].password_hash.startsWith('$2b$')).toBe(true);
    });

    it('Should insert sample products', async () => {
        const res = await pool.query("SELECT * FROM products");
        expect(res.rows.length).toBeGreaterThanOrEqual(5);
    });
});
```

### File: `tests/phase2.test.js`
```javascript
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
```

### File: `tests/phase3.test.js`
```javascript
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
```

### File: `tests/phase4.test.js`
```javascript
const request = require('supertest');
const app = require('../server/server');
const pool = require('../server/db/index');
const { runSeed } = require('../server/db/seed');

describe('Phase 4: Auth & Protected Routes', () => {
    let token = '';

    beforeAll(async () => await runSeed());
    afterAll(async () => await pool.end());

    it('POST /api/v1/auth/login returns a JWT for valid credentials', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@minishop.com', password: 'admin123' })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(typeof res.body.data.token).toBe('string');
        token = res.body.data.token;
    });

    it('DELETE /api/v1/products/:id without token returns 401 UNAUTHORIZED', async () => {
        const res = await request(app)
            .delete('/api/v1/products/1')
            .expect('Content-Type', /json/)
            .expect(401);

        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('DELETE /api/v1/products/:id with token performs soft delete', async () => {
        const res = await request(app)
            .delete('/api/v1/products/1')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(res.body.success).toBe(true);

        // Verify row still exists but is_active is false
        const dbCheck = await pool.query('SELECT is_active FROM products WHERE id = 1');
        expect(dbCheck.rows.length).toBe(1);
        expect(dbCheck.rows[0].is_active).toBe(false);
    });
});
```
