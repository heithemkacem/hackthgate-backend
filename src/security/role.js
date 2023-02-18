const ROLES = {
  CLIENT: "CLIENT",
};

const inRole =
  (...roles) =>
  (req, res, next) => {
    const role = roles.find((role) => req.user.role === role);
    if (!role) {
      return res.json({
        status: "Failed",
        message: "You are not authorized to access this resource",
      });
    }
    next();
  };

module.exports = {
  inRole,
  ROLES,
};
