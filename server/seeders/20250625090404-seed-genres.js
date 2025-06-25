"use strict";
const axios = require("axios");

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const { data } = await axios.get(
        "https://www.freetogame.com/api/games?platform=pc"
      );

      // Extract unique genres
      const genreSet = new Set(data.map((game) => game.genre));
      const genres = Array.from(genreSet).map((genre) => ({
        name: genre,
        description: `Games under the ${genre} genre`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Check existing genres in DB
      const existingGenres = await queryInterface.sequelize.query(
        `SELECT name FROM "Genres";`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      const existingNames = new Set(existingGenres.map((g) => g.name));

      // Filter out duplicates
      const newGenres = genres.filter((g) => !existingNames.has(g.name));

      // Insert unique only
      if (newGenres.length > 0) {
        await queryInterface.bulkInsert("Genres", newGenres);
      }
    } catch (error) {
      console.error("Error seeding genres:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Genres", null, {});
  },
};
