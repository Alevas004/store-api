const express = require("express");
const userRouter = require("./user.router");
const storeRouter = require("./store.router");
const productRouter = require("./product.router");
const orderRouter = require("./order.router");
const stripeRouter = require("./stripe.router");
const router = express.Router();

router.use(userRouter);
router.use(storeRouter);
router.use(productRouter);
router.use(orderRouter);
router.use(stripeRouter)

module.exports = router;
