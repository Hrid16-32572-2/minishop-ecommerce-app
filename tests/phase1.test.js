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
