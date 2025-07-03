"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      // M:N relation with User
      Genre.belongsToMany(models.User, {
        through: "UserGenres",
        foreignKey: "GenreId", // Changed to match migration (capital G)
        otherKey: "UserId", // Added otherKey (capital U)
      });
    }
  }

  Genre.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Genre",
    }
  );

  return Genre;
};
