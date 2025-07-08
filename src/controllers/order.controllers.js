const catchError = require("../utils/catchError");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Store = require("../models/Store");

const getAll = catchError(async (req, res) => {
  const results = await Order.findAll({
    include: [Product, User],
  });
  return res.json(results);
});

const getMyClientOrders = catchError(async (req, res) => {
  const id = req.user.id;

  const getOrders = await Order.findAll({
    where: { userId: id },
    include: [Product, Store],
  });

  res.status(200).json(getOrders);
});

const getMyStoreOrders = catchError(async (req, res) => {
  const id = req.user.id;

  const store = await Store.findOne({ where: { userId: id } });
  if (!store) return res.status(404).json({ error: "You don't have a store" });

  const getOrders = await Order.findAll({
    where: { storeId: store.id },
    include: [Product, User],
  });

  res.status(200).json(getOrders);
});

const create = catchError(async (req, res) => {
  const { paymentMethod, productId } = req.body;
  const id = req.user.id;

  const product = await Product.findByPk(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (product.isSold) {
    return res.status(400).json({ error: "Product is already sold" });
  }

  const result = await Order.create({
    userId: id,
    productId,
    storeId: product.storeId,
    paymentMethod,
    paymentStatus: "pending",
    total: product.price,
  });

  product.isSold = true;
  await product.save();
  return res.status(201).json(result);
});

const getOne = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await Order.findByPk(id);
  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByPk(id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const product = await Product.findByPk(order.productId);
  if (product) {
    product.isSold = false;
    await product.save();
  }

  await Order.destroy({ where: { id } });
  return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
  const { paymentMethod } = req.body;
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({ where: { id, userId } });
  if (!order)
    return res.status(404).json({ error: "You don't have permission to access this order" });

  const result = await Order.update({ paymentMethod }, {
    where: { id, userId },
    returning: true,
  });

  return res.json(result[1][0]);
});


module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  getMyClientOrders,
  getMyStoreOrders,
};
