var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
var opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

opts.secretOrKey = process.env.SECRET;

const { getClient } = require("../domains/client/controller");

let strategy = new JwtStrategy(opts, function (jwt_payload, next) {
  let client = getClient({ _id: jwt_payload.id });
  if (client) {
    return next(null, client);
  } else {
    return next(null, false);
    // or you could create a new account
  }
});

module.exports = { strategy };
