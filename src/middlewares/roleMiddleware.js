const isStore = (req, res, next) => {
  if (req.user.role !== "store") {
    return res
      .status(403)
      .json({ error: "Access denied: only for store users" });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: only for admin users" });
  }
  next();
};

const isStoreOrAdmin = (req, res, next) => {
  if (req.user.role !== "store" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: only for store and admin users" });
  }
  next();
};

const isClient = (req, res, next) => {
  if (req.user.role !== "client") {
    return res
      .status(403)
      .json({ error: "Access denied: only for client users" });
  }
  next();
};


const isClientOrAdmin = (req, res, next) => {
  if (req.user.role !== "client" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: only for client and admin users" });
  }
  next();
};

module.exports = { isStore, isAdmin, isStoreOrAdmin, isClient, isClientOrAdmin };
