const { Wishlist, GameList, User } = require("../models");

class WishlistController {
  // GET /wishlist → get current user's wishlist
  static async findAll(req, res, next) {
    try {
      const userId = req.user.id;

      const wishlistedGames = await Wishlist.findAll({
        where: { UserId: userId },
        include: {
          model: GameList,
        },
      });

      res.status(200).json(wishlistedGames);
    } catch (err) {
      next(err);
    }
  }

  // POST /wishlist/:gameId → add game to wishlist
  static async add(req, res, next) {
    try {
      const userId = req.user.id;
      const { gameId } = req.params;

      // Check if Game exists
      const game = await GameList.findByPk(gameId);
      if (!game) throw { name: "GameNotFound" };

      // Check if already in wishlist
      const existing = await Wishlist.findOne({
        where: {
          UserId: userId,
          GameListId: gameId,
        },
      });
      if (existing) throw { name: "AlreadyWishlisted" };

      const newWishlist = await Wishlist.create({
        UserId: userId,
        GameListId: gameId,
      });

      res
        .status(201)
        .json({ message: "Game added to wishlist", wishlist: newWishlist });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /wishlist/:gameId → remove from wishlist
  static async remove(req, res, next) {
    try {
      const userId = req.user.id;
      const { gameId } = req.params;

      // console.log(gameId, "<<<< gameId in remove wishlist");
      // console.log(userId, "<<<< userId in remove wishlist");

      const found = await Wishlist.findOne({
        where: {
          UserId: userId,
          GameListId: gameId,
        },
      });

      if (!found) throw { name: "NotInWishlist" };

      await Wishlist.destroy({
        where: {
          UserId: userId,
          GameListId: gameId,
        },
      });

      res.status(200).json({ message: "Game removed from wishlist" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WishlistController;
