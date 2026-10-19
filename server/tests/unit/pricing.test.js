const { calculatePrice } = require('../../src/services/pricing.service');

describe('Automated price calculation (FR-008)', () => {
  test.each([
    ['school', 20000],
    ['birthday', 60000],
    ['wedding', 40000],
  ])('%s event costs LKR %i', (type, expected) => {
    expect(calculatePrice(type)).toBe(expected);
  });
});