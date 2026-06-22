import jwt from "jsonwebtoken";

const roleSecrets = {
  ADMIN: () => process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD,
  DEAN: () => process.env.DEAN_EMAIL + process.env.DEAN_PASSWORD,
  DIRECTOR: () => process.env.DIRECTOR_EMAIL + process.env.DIRECTOR_PASSWORD,
};

const authRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const { admintoken } = req.headers;

      if (!admintoken) {
        return res
          .status(403)
          .json({ success: false, message: "admin credentials not found" });
      }

      const decodedToken = jwt.verify(admintoken, process.env.JWT_SECRET);
      const matchedRole = allowedRoles.find((role) => {
        const getSecret = roleSecrets[role];
        return getSecret && decodedToken.id === getSecret();
      });

      if (!matchedRole) {
        return res
          .status(403)
          .json({ success: false, message: "role is not authorized" });
      }

      req.body.authRole = matchedRole;
      req.body.adminID = decodedToken.id;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  };
};

export { authRole };
