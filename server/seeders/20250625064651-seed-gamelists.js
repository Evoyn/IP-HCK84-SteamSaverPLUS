"use strict";
const axios = require("axios");

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const { data } = await axios.get(
        "https://www.freetogame.com/api/games?platform=pc"
      );

      const games = data.map((game) => ({
        id: game.id,
        title: game.title,
        thumbnail: game.thumbnail,
        short_description: game.short_description,
        game_url: game.game_url,
        genre: game.genre,
        platform: game.platform,
        publisher: game.publisher,
        developer: game.developer,
        release_date: game.release_date,
        freetogame_profile_url: game.freetogame_profile_url,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert("GameLists", games, {});
    } catch (error) {
      console.error("Seeding GameList failed:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("GameLists", null, {});
  },
};
