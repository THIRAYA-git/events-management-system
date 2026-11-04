// TC-AUTH-xx  |  FR-002 / NFR-004  |  Middleware unit tests (no database)
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { authenticate, authorize, restrictTo } = require('../../src/middleware/auth.middleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const sign = (role, opts = {}) =>
  jwt.sign({ id: 1, email: 'x@y.lk', role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m', ...opts });

describe('authenticate()', () => {
  test('TC-AUTH-01 missing Authorization header returns 401', () => {
    const res = mockRes(); const next = jest.fn();
    authenticate({ headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
  test('TC-AUTH-02 malformed token returns 401', () => {
    const res = mockRes(); const next = jest.fn();
    authenticate({ headers: { authorization: 'Bearer not.a.token' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
  test('TC-AUTH-03 token signed with a wrong secret is rejected', () => {
    const bad = jwt.sign({ id: 1, role: 'admin' }, 'wrong-secret');
    const res = mockRes(); const next = jest.fn();
    authenticate({ headers: { authorization: `Bearer ${bad}` } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
  test('TC-AUTH-04 expired token returns 401 with TOKEN_EXPIRED code', () => {
    const expired = sign('customer', { expiresIn: -10 });
    const res = mockRes(); const next = jest.fn();
    authenticate({ headers: { authorization: `Bearer ${expired}` } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].code).toBe('TOKEN_EXPIRED');
  });
  test('TC-AUTH-05 valid token sets req.user and calls next()', () => {
    const req = { headers: { authorization: `Bearer ${sign('admin')}` } };
    const next = jest.fn();
    authenticate(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('admin');
  });
});

describe('authorize() and restrictTo()', () => {
  test('TC-AUTH-06 authorize denies a role without the permission (403)', () => {
    const res = mockRes(); const next = jest.fn();
    authorize('backup:manage')({ user: { role: 'customer' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  test('TC-AUTH-07 authorize allows a role that holds the permission', () => {
    const next = jest.fn();
    authorize('backup:manage')({ user: { role: 'admin' } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
  test('TC-AUTH-08 restrictTo denies other roles (403) and allows listed roles', () => {
    const res = mockRes(); const next = jest.fn();
    restrictTo('admin')({ user: { role: 'front_desk' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    const next2 = jest.fn();
    restrictTo('admin', 'front_desk')({ user: { role: 'front_desk' } }, mockRes(), next2);
    expect(next2).toHaveBeenCalled();
  });
  test('TC-AUTH-09 authorize without req.user returns 401', () => {
    const res = mockRes();
    authorize('booking:create')({}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
