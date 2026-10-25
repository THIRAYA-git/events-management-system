const request = require('supertest');
const app = require('../src/app');

async function login(email, password) {
  const r = await request(app).post('/api/auth/login').send({ email, password });
  const b = r.body;
  const token = b.accessToken || b.token || b.data?.accessToken;
  if (!token) {
    throw new Error(
      `Login failed for ${email} (status ${r.statusCode}): ${JSON.stringify(b)}`
    );
  }
  return token;
}
const auth = (t) => ({ Authorization: `Bearer ${t}` });

module.exports = { app, request, login, auth };