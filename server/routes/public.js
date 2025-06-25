const express = require("express");
const router = express.Router();
const PubGameListController = require("../controllers/pubGameListController");

// Public routes for game list
router.get("/", PubGameListController.getAllGames);
router.get("/:id", PubGameListController.getGameById);

// Export the router
module.exports = router;
