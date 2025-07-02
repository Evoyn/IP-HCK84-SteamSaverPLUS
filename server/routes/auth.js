const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const authentication = require("../middlewares/authentication");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/login/google", UserController.googleLogin);
router.put("/users/:id", authentication, UserController.updateUser);
router.get("/users/:id", authentication, UserController.getUserById);
// router.get("/users/:id", UserController.getUserById);

module.exports = router;
