"use strict";
const { hashPassword } = require("../helpers/bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Insert user
    await queryInterface.bulkInsert("Users", [
      {
        username: "Evoyn",
        email: "evoyn@gmail.com",
        password: hashPassword("123456"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Step 2: Get the inserted user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'nebu@gmail.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!users || users.length === 0) {
      throw new Error("User not found after insertion");
    }

    const userId = users[0].id;

    // Step 3: Get genre IDs (Shooter, MMORPG, Action)
    const genres = await queryInterface.sequelize.query(
      `SELECT id FROM "Genres" WHERE name IN ('Shooter', 'MMORPG', 'Action');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (genres.length === 0) {
      console.warn("No genres found. Make sure Genres table is seeded first.");
      return;
    }

    // Step 4: Insert into UserGenres
    const userGenres = genres.map((g) => ({
      UserId: userId,
      GenreId: g.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("UserGenres", userGenres);
  },

  async down(queryInterface, Sequelize) {
    // Remove user and their genres
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'nebu@gmail.com';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      const userId = users[0].id;
      await queryInterface.bulkDelete("UserGenres", { UserId: userId });
    }

    await queryInterface.bulkDelete("Users", { email: "nebu@gmail.com" });
  },
};
