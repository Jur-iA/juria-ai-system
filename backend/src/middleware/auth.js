const { verify } = require('../lib/jwt');

function authOptional(req, _res, next) {
  const token = getToken(req);
  if (token) {
    const payload = verify(token);
    if (payload) req.user = payload;
  }
  next();
}

function authRequired(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'missing_token' });
  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: 'invalid_token' });
  req.user = payload;
  next();
}

function getToken(req) {
  const h = req.headers['authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1] : null;
}

module.exports = { authOptional, authRequired };
