const {
  getAll,
  create,
  getOne,
  remove,
  update,
  getMyStore,
} = require("../controllers/store.controllers");
const express = require("express");
const protect = require("../middlewares/authMiddleware");
const { isStore, isAdmin, isStoreOrAdmin, isClient } = require("../middlewares/roleMiddleware");

const storeRouter = express.Router();

storeRouter.route("/stores").get(getAll).post(protect, isStore, create);

storeRouter.route("/stores/my-store").get(protect, isStore, getMyStore);

storeRouter.route("/stores/:id").get(protect, isClient, getOne).delete(protect, isAdmin, remove).put(protect, isStoreOrAdmin, update);

module.exports = storeRouter;
