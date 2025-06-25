const { GameList } = require("../models");
const { Op } = require("sequelize");

module.exports = class PubGameListController {
  static async getAllGames(req, res, next) {
    try {
      const { filter, sort, page, search } = req.query;
      let paramsQuerySQL = {};
      let whereConditions = {};

      if (filter) {
        paramsQuerySQL.where = {
          genre: filter,
        };
      }

      if (sort) {
        const ordering = sort[0] === "-" ? "DESC" : "ASC";
        // const columnName = ordering === "DESC" ? sort.slice(1) : sort;
        paramsQuerySQL.order = [["createdAt", ordering]];
      }

      if (search) {
        whereConditions.title = {
          [Op.iLike]: `%${search}%`,
        };
        paramsQuerySQL.where = whereConditions;
      }

      let limit = 10;
      let pageNumber = 1;
      if (page) {
        if (page.size) {
          limit = page.size;
          paramsQuerySQL.limit = limit;
        }

        if (page.number) {
          pageNumber = page.number;
          paramsQuerySQL.offset = limit * (pageNumber - 1);
        }
      }

      const { count, rows } = await GameList.findAndCountAll(paramsQuerySQL);

      res.status(200).json({
        page: pageNumber,
        data: rows,
        totalData: count,
        totalPage: Math.ceil(count / limit),
        dataPerPage: limit,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getGameById(req, res, next) {
    try {
      const { id } = req.params;
      const game = await GameList.findOne({
        where: {
          id,
          isPublic: true,
        },
      });
      if (!game) {
        throw { name: "NotFound", message: "Game not found" };
      }
      res.status(200).json(game);
    } catch (err) {
      next(err);
    }
  }
};
