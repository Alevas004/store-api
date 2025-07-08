const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");

const Product = sequelize.define("product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING, // URL de la imagen
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  discountPercentage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  allergens: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
});
// storeId
// orderId
/*
Relaciones necesarias:
- Product.belongsTo(Store) => cada producto pertenece a una tienda
- Store.hasMany(Product)
- Product.hasOne(Order) => para saber si ya fue comprado
*/

module.exports = Product;
