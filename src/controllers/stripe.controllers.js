const { default: Stripe } = require("stripe");
const Product = require("../models/Product");
const Order = require("../models/Order");
const sequelize = require("../utils/connection");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhook = async (req, res) => {
  console.log("🔥 Webhook recibido - iniciando procesamiento");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("✅ Webhook verificado correctamente:", event.type);
  } catch (err) {
    console.log("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    console.log("💳 Procesando checkout.session.completed");
    const session = event.data.object;

    console.log("🔍 Debug - Todos los metadatos recibidos:", session.metadata);
    console.log("🔍 Debug - Session ID:", session.id);

    try {
      const userId = session.metadata?.userId;
      const productId = session.metadata?.productId;
      const paymentMethod = session.payment_method_types[0];
      const total = session.amount_total / 100;

      console.log("📊 Datos del webhook:", {
        userId,
        productId,
        paymentMethod,
        total,
        sessionId: session.id,
      });

      // Usar transacción para garantizar consistencia
      const transaction = await sequelize.transaction();

      try {
        const product = await Product.findByPk(productId, { transaction });
        console.log(
          "📦 Producto encontrado:",
          product ? `${product.name} (ID: ${product.id})` : "No encontrado"
        );

        if (!product || product.isSold) {
          console.log("❌ Producto inválido o ya vendido. Estado actual:", {
            exists: !!product,
            isSold: product?.isSold,
          });
          await transaction.rollback();
          return res.sendStatus(200); // Respondemos igual para que Stripe no repita
        }

        // Crear la orden
        const newOrder = await Order.create(
          {
            userId,
            productId,
            storeId: product.storeId,
            paymentMethod,
            paymentStatus: "paid",
            total,
            purchasedAt: new Date(session.created * 1000),
          },
          { transaction }
        );

        console.log("✅ Orden creada exitosamente:", {
          orderId: newOrder.id,
          productId: newOrder.productId,
          userId: newOrder.userId,
        });

        // Marcar producto como vendido
        console.log("🔄 Marcando producto como vendido...");
        product.isSold = true;
        await product.save({ transaction });

        // Confirmar la transacción
        await transaction.commit();

        console.log(
          "✅ Transacción completada - Producto marcado como vendido exitosamente"
        );

        // Verificar que se guardó correctamente
        const updatedProduct = await Product.findByPk(productId);
        console.log(
          "🔍 Verificación final - producto isSold:",
          updatedProduct.isSold
        );
      } catch (transactionError) {
        await transaction.rollback();
        throw transactionError; // Re-lanzar para que lo capture el catch exterior
      }
    } catch (error) {
      console.error("❌ Error creando orden o actualizando producto:", error);
      console.error("Stack trace:", error.stack);
      // Respondemos igual para que Stripe no vuelva a intentar
    }
  } else {
    console.log(`ℹ️ Evento no manejado: ${event.type}`);
  }

  return res.sendStatus(200); // SIEMPRE respondemos 200
};

const createCheckoutSession = async (req, res) => {
  const { userId, productId } = req.body;

  console.log("🚀 Checkout iniciado:", { userId, productId });
  console.log("🔑 Variables de entorno:", {
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
  });

  try {
    // Buscar producto
    const product = await Product.findByPk(productId);
    console.log(
      "📦 Product encontrado:",
      product
        ? {
            id: product.id,
            name: product.name,
            price: product.price,
            isSold: product.isSold,
            storeId: product.storeId,
          }
        : "No encontrado"
    );

    if (!product || product.isSold) {
      return res.status(400).json({ error: "Producto no disponible" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
              description: product.description || "",
            },
            unit_amount: Math.round(product.price * 100), // en centavos
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        productId: productId.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/api/stripe/create-checkout-session/success?productId=${productId}&userId=${userId}`,
      cancel_url: `${process.env.FRONTEND_URL}/api/stripe/create-checkout-session/cancel`,
    });
    console.log("🧠 Metadata enviada a Stripe:", session.metadata);
    console.log("✅ Sesión de checkout creada exitosamente:", session.id);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creando checkout session:", error);
    res.status(500).json({ error: "No se pudo crear la sesión de pago" });
  }
};

module.exports = { stripeWebhook, createCheckoutSession };
