const express = require("express");
const router = express.Router();
const WishListController = require("../controllers/wishListController");
const authentication = require("../middlewares/authentication");

router.use(authentication);

// only get delete post
router.get("/", WishListController.findAll);
router.post("/:gameId", WishListController.add);
router.delete("/:gameId", WishListController.remove);

module.exports = router;
