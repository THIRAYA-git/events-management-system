// TC-VAL-xx  |  FR-005, FR-009  |  Booking input validation (black-box, boundary values)
const { validationResult } = require('express-validator');
const { validateCreateBooking } = require('../../src/validators/booking.validator');

const base = {
  hall_id: 1, event_date: '2031-03-10', start_time: '10:00', end_time: '16:00',
  event_type: 'Birthday Function', guest_count: 300,
};
const run = async (body) => {
  const req = { body: { ...base, ...body }, headers: {}, params: {}, query: {} };
  for (const rule of validateCreateBooking) await rule.run(req);
  const r = validationResult(req);
  return { ok: r.isEmpty(), fields: r.array().map((e) => e.path), req };
};

describe('Booking validator (FR-005)', () => {
  test('TC-VAL-01 valid booking passes', async () => expect((await run({})).ok).toBe(true));
  test('TC-VAL-02 guest_count = 1 (lower boundary) passes', async () =>
    expect((await run({ guest_count: 1 })).ok).toBe(true));
  test('TC-VAL-03 guest_count = 0 is rejected', async () =>
    expect((await run({ guest_count: 0 })).fields).toContain('guest_count'));
  test('TC-VAL-04 guest_count = 1200 (upper boundary) passes', async () =>
    expect((await run({ guest_count: 1200 })).ok).toBe(true));
  test('TC-VAL-05 guest_count = 1201 is rejected', async () =>
    expect((await run({ guest_count: 1201 })).fields).toContain('guest_count'));
  test('TC-VAL-06 guest_count as text is rejected', async () =>
    expect((await run({ guest_count: 'many' })).fields).toContain('guest_count'));
  test('TC-VAL-07 missing event_date is rejected', async () =>
    expect((await run({ event_date: undefined })).fields).toContain('event_date'));
  test('TC-VAL-08 invalid date text is rejected', async () =>
    expect((await run({ event_date: 'tomorrow' })).fields).toContain('event_date'));
  test('TC-VAL-09 start_time 25:99 is rejected', async () =>
    expect((await run({ start_time: '25:99' })).fields).toContain('start_time'));
  test('TC-VAL-10 start_time 23:59 passes', async () =>
    expect((await run({ start_time: '23:59' })).ok).toBe(true));
  test('TC-VAL-11 missing hall_id is rejected', async () =>
    expect((await run({ hall_id: undefined })).fields).toContain('hall_id'));
  test('TC-VAL-12 hall_id 0 is rejected', async () =>
    expect((await run({ hall_id: 0 })).fields).toContain('hall_id'));
  test('TC-VAL-13 missing event_type is rejected', async () =>
    expect((await run({ event_type: undefined })).fields).toContain('event_type'));
  test('TC-VAL-14 room_count 5 passes, 6 is rejected (FR-009)', async () => {
    expect((await run({ room_count: 5 })).ok).toBe(true);
    expect((await run({ room_count: 6 })).fields).toContain('room_count');
  });
  test('TC-VAL-15 negative room_count, discount, tax and add-ons are rejected', async () => {
    expect((await run({ room_count: -1 })).fields).toContain('room_count');
    expect((await run({ discount_amount: -5 })).fields).toContain('discount_amount');
    expect((await run({ tax_amount: -5 })).fields).toContain('tax_amount');
    expect((await run({ extra_addons: -5 })).fields).toContain('extra_addons');
  });
  test('TC-VAL-16 special_requests over 2000 characters is rejected', async () =>
    expect((await run({ special_requests: 'x'.repeat(2001) })).fields).toContain('special_requests'));
  test('TC-VAL-17 string numbers are converted (guest_count "250" -> 250)', async () => {
    const r = await run({ guest_count: '250' });
    expect(r.ok).toBe(true);
    expect(r.req.body.guest_count).toBe(250);
  });
});
