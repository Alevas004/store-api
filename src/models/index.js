const Order = require("./Order");
const Product = require("./Product");
const Store = require("./Store");
const User = require("./User");

//Associations between User and Store
Store.belongsTo(User);
User.hasMany(Store);




User.hasMany(Order);
Order.belongsTo(User);




//Associations between Product and Order
Product.belongsTo(Store);
Store.hasMany(Product);

Product.hasOne(Order);
Order.belongsTo(Product);



Order.belongsTo(Store)
Store.hasMany(Order);