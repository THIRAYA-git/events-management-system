// TC-PRC-xx  |  FR-008, FR-009, FR-023  |  Price calculation logic with the database mocked
jest.mock('../../src/config/db', () => ({ query: jest.fn() }));
const { query } = require('../../src/config/db');
const {
  getEventPrice, calculateBookingTotal, ROOM_RATE_PER_DAY, MAX_ROOMS,
} = require('../../src/services/pricing.service');

const price = (base, both = null, active = true) =>
  query.mockResolvedValueOnce({
    rows: [{ event_type: 'X', base_price: String(base), both_halls_price: both === null ? null : String(both), is_active: active }],
  });

beforeEach(() => query.mockReset());

describe('Event price lookup (FR-008)', () => {
  test('TC-PRC-01 single-hall price is returned', async () => {
    price(40000, 60000);
    expect((await getEventPrice('Walima Event')).basePrice).toBe(40000);
  });
  test('TC-PRC-02 both-halls price overrides the base price', async () => {
    price(40000, 60000);
    expect((await getEventPrice('Walima Event', { useBothHalls: true })).basePrice).toBe(60000);
  });
  test('TC-PRC-03 when no both-halls price exists the base price is kept', async () => {
    price(20000, null);
    expect((await getEventPrice('School Event', { useBothHalls: true })).basePrice).toBe(20000);
  });
  test('TC-PRC-04 unknown event type is rejected', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(getEventPrice('Karaoke')).rejects.toThrow(/Unknown event_type/);
  });
  test('TC-PRC-05 an inactive event type cannot be booked', async () => {
    price(30000, null, false);
    await expect(getEventPrice('Other')).rejects.toThrow(/not available/);
  });
});

describe('Booking total (FR-008, FR-009)', () => {
  test('TC-PRC-06 constants: LKR 5,000 per room per day, 5 rooms', () => {
    expect(ROOM_RATE_PER_DAY).toBe(5000);
    expect(MAX_ROOMS).toBe(5);
  });
  test('TC-PRC-07 total = hall price + rooms x 5,000', async () => {
    price(60000);
    const t = await calculateBookingTotal({ eventType: 'Birthday Function', roomCount: 2 });
    expect(t.roomCost).toBe(10000);
    expect(t.totalAmount).toBe(70000);
  });
  test('TC-PRC-08 add-ons and tax are added, discount is subtracted', async () => {
    price(40000);
    const t = await calculateBookingTotal({
      eventType: 'Wedding Function', extraAddons: 3000, taxAmount: 500, discountAmount: 1500,
    });
    expect(t.totalAmount).toBe(42000);
  });
  test('TC-PRC-09 more than 5 rooms is rejected', async () => {
    await expect(calculateBookingTotal({ eventType: 'x', roomCount: 6 })).rejects.toThrow(/between 0 and 5/);
  });
  test('TC-PRC-10 negative room count is rejected', async () => {
    await expect(calculateBookingTotal({ eventType: 'x', roomCount: -1 })).rejects.toThrow();
  });
  test('TC-PRC-11 negative discount, add-on or tax is rejected', async () => {
    await expect(calculateBookingTotal({ eventType: 'x', discountAmount: -1 })).rejects.toThrow(/negative/);
  });
  test('TC-PRC-12 discount larger than the total is rejected', async () => {
    price(20000);
    await expect(
      calculateBookingTotal({ eventType: 'School Event', discountAmount: 99999 })
    ).rejects.toThrow(/cannot exceed/);
  });
});
