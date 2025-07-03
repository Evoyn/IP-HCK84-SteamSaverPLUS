"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GameList extends Model {
    static associate(models) {
      GameList.belongsToMany(models.User, { through: models.Wishlist });
    }
  }
  GameList.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Please enter your title",
          },
          notNull: {
            msg: "Please enter your title",
          },
        },
      },
      thumbnail: DataTypes.STRING,
      short_description: DataTypes.TEXT,
      game_url: DataTypes.STRING,
      genre: DataTypes.STRING,
      platform: DataTypes.STRING,
      publisher: DataTypes.STRING,
      developer: DataTypes.STRING,
      release_date: DataTypes.DATEONLY,
      freetogame_profile_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "GameList",
    }
  );
  return GameList;
};
