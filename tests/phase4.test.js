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
