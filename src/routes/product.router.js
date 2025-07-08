const {
  getAll,
  create,
  getOne,
  remove,
  update,
  getSoldProducts,
  getMyProducts,
  getActiveProducts,
} = require("../controllers/product.controllers");
const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { isStore, isAdmin } = require("../middlewares/roleMiddleware");

const productRouter = express.Router();

productRouter.route("/products").get(protect, isAdmin, getAll).post(protect, isStore, create);
productRouter.route("/products/sold").get(protect, isStore, getSoldProducts);
productRouter.route("/products/my-products").get(protect, isStore, getMyProducts);
productRouter.route("/products/available").get(getActiveProducts)
productRouter.route("/products/:id").get(getOne).delete(protect, isStore, remove).put(protect, isStore, update);

module.exports = productRouter;
