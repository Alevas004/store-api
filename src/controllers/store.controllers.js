const catchError = require("../utils/catchError");
const Store = require("../models/Store");
const User = require("../models/User");
const Product = require("../models/Product");
const { Op } = require("sequelize");

const getAll = catchError(async (req, res) => {
  const results = await Store.findAll({ include: User });
  return res.json(results);
});

const getMyStore = catchError(async (req, res) => {
  const id = req.user.id;
  const result = await Store.findOne({
    include: Product,
    where: { userId: id },
  });
  if (!result) return res.status(404).json({ error: "You don't have a store" });
  return res.json(result);
});

const create = catchError(async (req, res) => {
  const {
    name,
    description,
    address,
    city,
    country,
    postalCode,
    latitude,
    longitude,
    image,
    phone,
    email,
  } = req.body;

  const id = req.user.id;

  const hasStore = await Store.findOne({ where: { userId: id } });
  if (hasStore) {
    return res.status(400).json({ error: "You already have a store" });
  }

  const newStore = await Store.create({
    userId: id,
    name,
    description,
    address,
    city,
    country,
    postalCode,
    latitude,
    longitude,
    image,
    phone,
    email,
  });
  return res.status(201).json(newStore);
});

const getOne = catchError(async (req, res) => {
  const { id } = req.params;
  const today = new Date();

  const product = await Product.findOne({ where: { storeId: id } });

  if (!product)
    return res.status(404).json({ error: "No products found for this store" });

  const result = await Store.findOne({
    include: {
      model: Product,
      where: { isSold: false, isActive: true, expiresAt: { [Op.gt]: today } },
    },
    where: { id },
    required: false,
  });

  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  await Store.destroy({ where: { id } });
  return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
  const {
    name,
    description,
    address,
    city,
    country,
    postalCode,
    latitude,
    longitude,
    image,
    phone,
    email,
  } = req.body;
  const { id } = req.params;
  const capturedId = req.user.id;

  const store = await Store.findOne({ where: { userId: capturedId } });

  if (!store)
    return res
      .status(404)
      .json({ error: "You can only modify your own store" });

  const result = await Store.update(
    {
      name,
      description,
      address,
      city,
      country,
      postalCode,
      latitude,
      longitude,
      image,
      phone,
      email,
    },
    {
      where: { id },
      returning: true,
    }
  );
  if (result[0] === 0) return res.sendStatus(404);
  return res.json(result[1][0]);
});

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  getMyStore,
};
