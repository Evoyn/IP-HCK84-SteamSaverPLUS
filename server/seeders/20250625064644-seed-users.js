"use strict";
const { hashPassword } = require("../helpers/bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        username: "Nebu",
        email: "nebu@gmail.com",
        password: hashPassword("123456"),
        favouriteGenre: ["Shooter", "MMORPG", "Action"], // max 3 allowed
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", users);
  },
};
