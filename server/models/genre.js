"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      // M:N relation, to be set up after UserGenres join table is created
      Genre.belongsToMany(models.User, { through: "UserGenres" });
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
