const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.STRING, // ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: "pending",
  },
  paymentMethod: {
    type: DataTypes.STRING, // ENUM('paypal', 'googlepay', 'applepay'),
    allowNull: false,
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
  // userId
  // productId
  // storeId
/*
Relaciones necesarias:
- Order.belongsTo(User) => quién compró
- User.hasMany(Order)
- Order.belongsTo(Product) => qué producto compró
- Product.hasOne(Order)
*/
 Order.prototype.toJSON = function () {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
  }
module.exports = Order;
