// TC-ACC-xx  |  NFR-004  |  Access-control matrix over the real Express app.
// Tokens are signed locally with the server's JWT secret, so these tests need NO database:
// the middleware rejects the request before any query runs.
require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const tokenFor = (role) =>
  jwt.sign({ id: 9999, email: `${role}@test.local`, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
const as = (role) => ({ Authorization: `Bearer ${tokenFor(role)}` });

// [id, method, path, role that must be refused]
const FORBIDDEN = [
  ['TC-ACC-01', 'get',   '/api/analytics/dashboard',            'front_desk', 'analytics is admin-only'],
  ['TC-ACC-02', 'get',   '/api/analytics/dashboard',            'customer',   'analytics is admin-only'],
  ['TC-ACC-03', 'get',   '/api/admin/backups',                  'front_desk', 'backups are admin-only'],
  ['TC-ACC-04', 'post',  '/api/admin/backups',                  'customer',   'backups are admin-only'],
  ['TC-ACC-05', 'get',   '/api/reports',                        'customer',   'reports need report:read'],
  ['TC-ACC-06', 'get',   '/api/reports',                        'front_desk', 'reports need report:read'],
  ['TC-ACC-07', 'get',   '/api/bookings',                       'customer',   'only staff list all bookings'],
  ['TC-ACC-08', 'get',   '/api/feedback',                       'customer',   'feedback inbox is admin-only'],
  ['TC-ACC-09', 'post',  '/api/feedback',                       'admin',      'only customers submit feedback'],
  ['TC-ACC-10', 'get',   '/api/staff',                          'front_desk', 'staff management is admin-only'],
  ['TC-ACC-11', 'get',   '/api/rooms/reservations',             'customer',   'all room reservations are staff-only'],
  ['TC-ACC-12', 'post',  '/api/rooms/reservations',             'admin',      'only customers create room reservations'],
  ['TC-ACC-13', 'get',   '/api/catering-orders',                'customer',   'catering order table is staff/restaurant only'],
  ['TC-ACC-14', 'patch', '/api/bookings/1/status',              'customer',   'customers cannot approve bookings'],
  ['TC-ACC-15', 'patch', '/api/bookings/1/payment/cash',        'customer',   'customers cannot record cash payments'],
  ['TC-ACC-16', 'put',   '/api/pricing/event-types/Birthday%20Function',    'front_desk', 'only admin edits prices'],
  ['TC-ACC-16b', 'put',  '/api/pricing/event-types/Birthday%20Function', 'customer',  'only admin edits prices'],
  ['TC-ACC-17', 'get',   '/api/users',                          'customer',   'user list is staff-only'],
  ['TC-ACC-18', 'get',   '/api/bookings/mine',                  'admin',      '"mine" is for customers'],
];

describe('Role refusals (403)', () => {
  test.each(FORBIDDEN)('%s %s %s as %s -> 403 (%s)', async (id, method, path, role) => {
    const res = await request(app)[method](path).set(as(role)).send({});
    expect(res.statusCode).toBe(403);
  });
});

const PROTECTED = [
  ['TC-ACC-19', 'get',  '/api/bookings'],
  ['TC-ACC-20', 'post', '/api/bookings'],
  ['TC-ACC-21', 'get',  '/api/bookings/mine'],
  ['TC-ACC-22', 'get',  '/api/analytics/dashboard'],
  ['TC-ACC-23', 'get',  '/api/reports'],
  ['TC-ACC-24', 'get',  '/api/staff'],
  ['TC-ACC-25', 'get',  '/api/rooms/reservations/mine'],
  ['TC-ACC-26', 'get',  '/api/admin/backups'],
  ['TC-ACC-27', 'get',  '/api/auth/me'],
];

describe('Unauthenticated requests (401)', () => {
  test.each(PROTECTED)('%s %s %s without a token -> 401', async (id, method, path) => {
    const res = await request(app)[method](path).send({});
    expect(res.statusCode).toBe(401);
  });

  test('TC-ACC-28 a tampered token is rejected with 401', async () => {
    const bad = jwt.sign({ id: 1, role: 'admin' }, 'not-the-real-secret');
    const res = await request(app).get('/api/analytics/dashboard').set({ Authorization: `Bearer ${bad}` });
    expect(res.statusCode).toBe(401);
  });
  test('TC-ACC-29 an expired token is rejected with 401', async () => {
    const old = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_ACCESS_SECRET, { expiresIn: -60 });
    const res = await request(app).get('/api/analytics/dashboard').set({ Authorization: `Bearer ${old}` });
    expect(res.statusCode).toBe(401);
  });
});

describe('Input validation before the database (422)', () => {
  const ok = { hall_id: 1, event_date: '2031-03-10', start_time: '10:00', end_time: '16:00', event_type: 'Birthday Function', guest_count: 300 };
  test.each([
    ['TC-ACC-30', 'guest count 1300', { guest_count: 1300 }],
    ['TC-ACC-31', 'guest count 0', { guest_count: 0 }],
    ['TC-ACC-32', 'bad start time', { start_time: '25:99' }],
    ['TC-ACC-33', 'six rooms', { room_count: 6 }],
  ])('%s booking with %s -> 422', async (id, label, patch) => {
    const res = await request(app).post('/api/bookings').set(as('customer')).send({ ...ok, ...patch });
    expect(res.statusCode).toBe(422);
  });
});
