const catchError = require("../utils/catchError");
const Product = require("../models/Product");
const Store = require("../models/Store");
const { Op } = require("sequelize");
const User = require("../models/User");
const Order = require("../models/Order");

const getAll = catchError(async (req, res) => {
  const results = await Product.findAll({
    include: Store,
  });
  return res.json(results);
});

const getActiveProducts = catchError(async (req, res) => {
  const today = new Date();

  const activeProducts = await Product.findAll({
    include: Store,
    where: { isActive: true, isSold: false, expiresAt: { [Op.gt]: today } },
  });

  return res.json(activeProducts);
});

const getMyProducts = catchError(async (req, res) => {
  const id = req.user.id;

  const hasOneStore = await Store.findOne({ where: { userId: id } });
  if (!hasOneStore) {
    return res
      .status(403)
      .json({ message: "You must have a store to see your products" });
  }

  const myProducts = await Product.findAll({
    where: { storeId: hasOneStore.id, isSold: false },
  });

  return res.json(myProducts);
});

const getSoldProducts = catchError(async (req, res) => {
  const id = req.user.id;

  const hasOneStore = await Store.findOne({ where: { userId: id } });
  if (!hasOneStore) {
    return res
      .status(403)
      .json({ message: "You must have a store to see sold products" });
  }

  const getMySoldProducts = await Product.findAll({
    include: [
      {
        model: Order,
        include: [User], // 👈 esto trae los datos del comprador
      }
    ] , 
    where: { storeId: hasOneStore.id, isSold: true },
  });
  return res.json(getMySoldProducts);
});

const create = catchError(async (req, res) => {
  const {
    name,
    description,
    image,
    price,
    expiresAt,
    category,
    allergens,
    discountPercentage,
  } = req.body;
  const id = req.user.id;

  const userHasStore = await Store.findOne({ where: { userId: id } });
  console.log("userHasStore", userHasStore);
  if (!userHasStore) {
    return res
      .status(403)
      .json({ message: "You must have a store to create products" });
  }

  const newProduct = await Product.create({
    name,
    description,
    image,
    price,
    expiresAt,
    category,
    allergens,
    discountPercentage,
    storeId: userHasStore.id,
  });

  return res.status(201).json(newProduct);
});

const getOne = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await Product.findOne({ include: Store, where: { id } });
  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ where: { id } });
  if (!product) return res.status(404).json({ error: "Product not found" });
  await Product.destroy({ where: { id } });
  return res.status(204).json({ message: "Product deleted successfully" });
});

const update = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await Product.update(req.body, {
    where: { id },
    returning: true,
  });
  if (result[0] === 0) return res.sendStatus(404);
  return res.json(result[1][0]);
});

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  getSoldProducts,
  getMyProducts,
  getActiveProducts,
};
