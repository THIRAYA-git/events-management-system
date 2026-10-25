const { app, request, login, auth } = require('../helpers');
const db = require('../../src/config/db');

let customer;
const HALL_ID = Number(process.env.TEST_HALL_ID || 1);

// Test bookings use dates in 2031 so they are easy to find and clean up
const testDate = (offsetDays) =>
  new Date(Date.UTC(2031, 0, 1) + offsetDays * 864e5).toISOString().slice(0, 10);

const payload = (o = {}) => ({
  hall_id: HALL_ID,
  event_date: testDate(10),
  start_time: '10:00',
  end_time: '16:00',
  event_type: 'Birthday Function',
  guest_count: 300,
  ...o,
});

const post = (body, token = customer) =>
  request(app).post('/api/bookings').set(auth(token)).send(body);

beforeAll(async () => {
  customer = await login('test@example.com', process.env.CUSTOMER_PW);
});

afterAll(async () => {
  try {
    await db.query(
      "DELETE FROM bookings WHERE event_date BETWEEN '2031-01-01' AND '2031-12-31'"
    );
  } catch (e) {
    console.warn('Cleanup skipped:', e.message);
  }
});

describe('Booking validation (FR-005)', () => {
  test('guest count above 1,200 is rejected', async () => {
    expect((await post(payload({ guest_count: 1300 }))).statusCode).toBe(422);
  });

  test('guest count of zero is rejected', async () => {
    expect((await post(payload({ guest_count: 0 }))).statusCode).toBe(422);
  });

  test('missing event date is rejected', async () => {
    expect((await post(payload({ event_date: undefined }))).statusCode).toBe(422);
  });

  test('invalid time format is rejected', async () => {
    expect((await post(payload({ start_time: '25:99' }))).statusCode).toBe(422);
  });

  test('more than 5 rooms is rejected (FR-009)', async () => {
    expect((await post(payload({ room_count: 6 }))).statusCode).toBe(422);
  });

  test('booking without a token is rejected', async () => {
    const r = await request(app).post('/api/bookings').send(payload());
    expect(r.statusCode).toBe(401);
  });
});

describe('Booking creation (FR-005, FR-008)', () => {
  test('valid booking is created', async () => {
    const r = await post(payload({ event_date: testDate(20) }));
    console.log('CREATE RESPONSE:', JSON.stringify(r.body));
    expect([200, 201]).toContain(r.statusCode);
  });

  test('exactly 1,200 guests passes validation', async () => {
    const r = await post(payload({ event_date: testDate(21), guest_count: 1200 }));
    expect(r.statusCode).not.toBe(422);
  });
});

describe('RBAC (NFR-004)', () => {
  test('customer cannot list all users', async () => {
    const r = await request(app).get('/api/users').set(auth(customer));
    expect([401, 403]).toContain(r.statusCode);
  });

  test('customer cannot change booking status', async () => {
    const r = await request(app)
      .patch('/api/bookings/1/status')
      .set(auth(customer))
      .send({ status: 'confirmed' });
    expect(r.statusCode).toBe(403);
  });
});