const {
  getAll,
  getOne,
  remove,
  update,
  getMyClientOrders,
  getMyStoreOrders,
} = require("../controllers/order.controllers");
const express = require("express");
const protect = require("../middlewares/authMiddleware");
const {
  isClient,
  isAdmin,
  isClientOrAdmin,
  isStore,
} = require("../middlewares/roleMiddleware");
const { stripeWebhook } = require("../controllers/stripe.controllers");

const orderRouter = express.Router();

orderRouter
  .route("/orders")
  .get(protect, isAdmin, getAll)

orderRouter
  .route("/orders/my-orders")
  .get(protect, isClient, getMyClientOrders);

orderRouter
  .route("/orders/store-orders")
  .get(protect, isStore, getMyStoreOrders);

orderRouter
  .route("/orders/:id")
  .get(protect, getOne)
  .delete(protect, isClientOrAdmin, remove)
  .put(protect, isClientOrAdmin, update);

module.exports = orderRouter;
