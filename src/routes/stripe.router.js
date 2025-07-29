const express = require("express");
const { stripeWebhook, createCheckoutSession } = require("../controllers/stripe.controllers");


// Importante usar express.raw para que Stripe pueda validar la firma

const stripeRouter = express.Router();

stripeRouter.route("/api/stripe/create-checkout-session").post(createCheckoutSession)

module.exports = stripeRouter;
