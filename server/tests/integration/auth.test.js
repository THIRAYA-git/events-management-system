const request = require('supertest');
const app = require('../../src/app');

describe('Login (FR-002)', () => {
  test('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  test('SQL injection attempt is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "' OR 1=1 --", password: 'x' });
    expect(res.statusCode).not.toBe(200);
  });
});