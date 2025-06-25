const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/authentication");
const geminiController = require("../controllers/geminiController");

// Middleware to ensure user is authenticated
router.use(authentication);
// Route to get game recommendations based on user's favorite genres
router.get("/", geminiController.getRecommendations);

module.exports = router;
