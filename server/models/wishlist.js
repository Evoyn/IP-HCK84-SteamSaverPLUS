"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User);
      Wishlist.belongsTo(models.GameList);
    }
  }
  Wishlist.init(
    {
      UserId: DataTypes.INTEGER,
      GameListId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Wishlist",
    }
  );
  return Wishlist;
};
