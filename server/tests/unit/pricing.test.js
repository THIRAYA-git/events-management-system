const {
  getEventPrice,
  ROOM_RATE_PER_DAY,
} = require('../../src/services/pricing.service');

describe('Automated price calculation (FR-008)', () => {
  test.each([
    ['School Event', 20000],
    ['Political Event', 30000],
    ['Political Event (Large)', 35000],
    ['Birthday Function', 60000],
    ['Wedding Function', 40000],
    ['Walima Event', 40000],
    ['Other', 30000],
  ])('%s costs LKR %i', async (type, expected) => {
    const result = await getEventPrice(type);
    expect(result.basePrice).toBe(expected);
  });

  test('Walima Event costs LKR 60,000 when both halls are booked', async () => {
    const result = await getEventPrice('Walima Event', { useBothHalls: true });
    expect(result.basePrice).toBe(60000);
  });

  test('event without a both-halls price keeps the same price for two halls', async () => {
    const result = await getEventPrice('School Event', { useBothHalls: true });
    expect(result.basePrice).toBe(20000);
  });

  test('unknown event type is rejected', async () => {
    await expect(getEventPrice('Karaoke Night')).rejects.toThrow(
      /Unknown event_type/
    );
  });

  test('room rate is LKR 5,000 per day (FR-009)', () => {
    expect(ROOM_RATE_PER_DAY).toBe(5000);
  });
});