const { GameList, Genre } = require("../models");

module.exports = class GameListController {
  static async getAllGames(req, res, next) {
    try {
      const games = await GameList.findAll();
      res.status(200).json(games);
    } catch (err) {
      next(err);
    }
  }

  static async getGameById(req, res, next) {
    try {
      const { id } = req.params;
      const game = await GameList.findByPk(id);
      if (!game) {
        throw { name: "NotFound", message: "Game not found" };
      }
      res.status(200).json(game);
    } catch (err) {
      next(err);
    }
  }

  static async createGame(req, res, next) {
    try {
      const game = await GameList.create(req.body);
      res.status(201).json(game);
    } catch (err) {
      next(err);
    }
  }

  static async updateGame(req, res, next) {
    try {
      const { id } = req.params;
      const [updated] = await GameList.update(req.body, {
        where: { id },
      });
      if (!updated) {
        throw { name: "NotFound", message: "Game not found" };
      }
      const updatedGame = await GameList.findByPk(id);
      res.status(200).json(updatedGame);
    } catch (err) {
      next(err);
    }
  }

  static async deleteGame(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await GameList.destroy({
        where: { id },
      });
      if (!deleted) {
        throw { name: "NotFound", message: "Game not found" };
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async getGenreGames(req, res, next) {
    try {
      const genre = await Genre.findAll();
      res.status(200).json(genre);
    } catch (error) {
      next(error);
    }
  }
};
