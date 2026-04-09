const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authorizationHeader = req.headers.authorization || '';

  if (!authorizationHeader.startsWith('Bearer ')) {
    res.sendEnvelope(401, false, null, 'UNAUTHORIZED');
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.sendEnvelope(401, false, null, 'UNAUTHORIZED');
  }
}

module.exports = authenticate;
