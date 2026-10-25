const { app, request, login, auth } = require('../helpers');
const db = require('../../src/config/db');

let customer, admin, frontdesk;
const HALL_A = Number(process.env.TEST_HALL_ID || 5);
const HALL_B = HALL_A === 5 ? 6 : 5;

const testDate = (offsetDays) =>
  new Date(Date.UTC(2031, 0, 1) + offsetDays * 864e5).toISOString().slice(0, 10);

const payload = (o = {}) => ({
  hall_id: HALL_A,
  event_date: testDate(40),
  start_time: '10:00',
  end_time: '16:00',
  event_type: 'Birthday Function',
  guest_count: 300,
  ...o,
});

const postBooking = (o) =>
  request(app).post('/api/bookings').set(auth(customer)).send(payload(o));

const createBooking = async (o) => {
  const r = await postBooking(o);
  expect([200, 201]).toContain(r.statusCode);
  return r.body.data.bookingId;
};

const setStatus = (id, status, token) =>
  request(app).patch(`/api/bookings/${id}/status`).set(auth(token)).send({ status });

beforeAll(async () => {
  customer  = await login('test@example.com', process.env.CUSTOMER_PW);
  admin     = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PW);
  frontdesk = await login(process.env.FD_EMAIL, process.env.FD_PW);
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

describe('Booking approval (FR-006)', () => {
  test('admin can confirm a pending booking', async () => {
    const id = await createBooking({ event_date: testDate(40) });
    const r = await setStatus(id, 'confirmed', admin);
    expect(r.statusCode).toBe(200);
  });

  test('front desk can confirm a pending booking', async () => {
    const id = await createBooking({ event_date: testDate(42) });
    const r = await setStatus(id, 'confirmed', frontdesk);
    expect(r.statusCode).toBe(200);
  });

  test('customer cannot confirm a booking', async () => {
    const id = await createBooking({ event_date: testDate(41) });
    const r = await setStatus(id, 'confirmed', customer);
    expect(r.statusCode).toBe(403);
  });
});

describe('Double booking prevention (FR-007, NFR-013)', () => {
  test('same hall and date cannot be booked twice, even while pending', async () => {
    const d = testDate(50);
    const first = await postBooking({ event_date: d });
    expect([200, 201]).toContain(first.statusCode);
    const second = await postBooking({ event_date: d });
    expect(second.statusCode).toBe(409);
  });

  test('second confirmed booking on the other hall, same date, is blocked', async () => {
    const d = testDate(51);
    const id1 = await createBooking({ event_date: d, hall_id: HALL_A });
    const id2 = await createBooking({ event_date: d, hall_id: HALL_B });
    expect((await setStatus(id1, 'confirmed', admin)).statusCode).toBe(200);
    const r = await setStatus(id2, 'confirmed', admin);
    expect(r.statusCode).toBe(409);
  });

  test('a cancelled booking frees the date', async () => {
    const d = testDate(52);
    const id1 = await createBooking({ event_date: d });
    await setStatus(id1, 'confirmed', admin);
    await setStatus(id1, 'cancelled', admin);
    const id2 = await createBooking({ event_date: d });
    expect((await setStatus(id2, 'confirmed', admin)).statusCode).toBe(200);
  });
});