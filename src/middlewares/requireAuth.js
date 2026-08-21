import { getAuth } from "@clerk/express";

const requireAuth = async (req, res, next) => {
  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated || !userId) {
    return res.status(401).json({
      success: false,
      msg: "User Unauthorized",
    });
  }

  req.userId = userId;

  next();
};

export default requireAuth;
