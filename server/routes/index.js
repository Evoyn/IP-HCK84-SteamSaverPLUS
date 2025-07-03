const express = require("express");
const router = express.Router();
const HelloController = require("../controllers/helloController");
const authRouter = require("./auth");
const gameListRouter = require("./gameList");
const PubGameListRouter = require("./public");
const wishListRouter = require("./wishList");
const recommendationRouter = require("./rec");

router.get("/", HelloController.getHello);

router.use("/", authRouter);
router.use("/games", gameListRouter);
router.use("/pub-games", PubGameListRouter);
router.use("/wishlist", wishListRouter);
router.use("/recommendations", recommendationRouter);

module.exports = router;
