const {
  getAll,
  create,
  getOne,
  remove,
  update,
  login,
  confirmEmail,
  logout,
} = require("../controllers/user.controllers");
const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");

const userRouter = express.Router();

userRouter.route("/users").get(protect, isAdmin, getAll);
userRouter.route("/users/confirm-email/:token").get(confirmEmail);

userRouter.route("/users/signup").post(create);

userRouter.route("/users/login").post(login);
userRouter.route("/users/logout").post(protect, logout);

userRouter
  .route("/users/:id")
  .get(protect, isAdmin ,getOne)
  .delete(protect, isAdmin, remove)
  .put(protect, update);

module.exports = userRouter;
