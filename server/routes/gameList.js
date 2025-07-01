const express = require("express");
const GameListController = require("../controllers/gameListController");
const router = express.Router();
const authentication = require("../middlewares/authentication");

router.use(authentication);
router.get("/genre", GameListController.getGenreGames); // get genre table
router.get("/", GameListController.getAllGames);
router.get("/:id", GameListController.getGameById);
router.post("/", authentication, GameListController.createGame);
router.put("/:id", authentication, GameListController.updateGame);
router.delete("/:id", authentication, GameListController.deleteGame);

module.exports = router;
