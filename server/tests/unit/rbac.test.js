// TC-RBAC-xx  |  NFR-004 Role-Based Access Control  |  White-box unit tests
const { can, getPermissions, PERMISSIONS } = require('../../src/utils/rbac.util');

describe('RBAC permission map (NFR-004)', () => {
  test('TC-RBAC-01 admin can approve bookings', () => {
    expect(can('admin', 'booking:approve')).toBe(true);
  });
  test('TC-RBAC-02 front desk cannot delete bookings', () => {
    expect(can('front_desk', 'booking:delete')).toBe(false);
  });
  test('TC-RBAC-03 customer can create a booking but not read all bookings', () => {
    expect(can('customer', 'booking:create')).toBe(true);
    expect(can('customer', 'booking:read_all')).toBe(false);
  });
  test('TC-RBAC-04 only admin can update event prices (FR-023)', () => {
    ['front_desk', 'customer', 'organizer', 'sponsor', 'restaurant'].forEach((r) =>
      expect(can(r, 'pricing:update')).toBe(false)
    );
    expect(can('admin', 'pricing:update')).toBe(true);
  });
  test('TC-RBAC-05 only admin can manage backups (NFR-017)', () => {
    expect(can('admin', 'backup:manage')).toBe(true);
    expect(can('front_desk', 'backup:manage')).toBe(false);
  });
  test('TC-RBAC-06 front desk and admin can record cash payments', () => {
    expect(can('front_desk', 'payment:record_cash')).toBe(true);
    expect(can('admin', 'payment:record_cash')).toBe(true);
    expect(can('customer', 'payment:record_cash')).toBe(false);
  });
  test('TC-RBAC-07 only customers can submit feedback (FR-018)', () => {
    expect(can('customer', 'feedback:create')).toBe(true);
    expect(can('admin', 'feedback:create')).toBe(false);
  });
  test('TC-RBAC-08 only the restaurant partner can update catering orders', () => {
    expect(can('restaurant', 'catering:update')).toBe(true);
    expect(can('customer', 'catering:update')).toBe(false);
  });
  test('TC-RBAC-09 unknown permission and unknown role are denied', () => {
    expect(can('admin', 'does:not_exist')).toBe(false);
    expect(can('hacker', 'booking:create')).toBe(false);
    expect(can(undefined, 'booking:create')).toBe(false);
  });
  test('TC-RBAC-10 there is no manager role in any permission', () => {
    const roles = new Set(Object.values(PERMISSIONS).flat());
    expect(roles.has('manager')).toBe(false);
    expect([...roles].sort()).toEqual(
      ['admin', 'customer', 'front_desk', 'organizer', 'restaurant', 'sponsor']
    );
  });
  test('TC-RBAC-11 getPermissions returns only permissions the role holds', () => {
    const p = getPermissions('customer');
    expect(p).toContain('room:create');
    expect(p).not.toContain('backup:manage');
  });
});
