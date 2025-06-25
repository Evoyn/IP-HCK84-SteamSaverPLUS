const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
module.exports = class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password, genres } = req.body;

      if (!Array.isArray(genres) || genres.length === 0) {
        throw {
          name: "BadRequest",
          message: "Genres must be an array with at least 1 item.",
        };
      }

      if (genres.length > 3) {
        throw {
          name: "BadRequest",
          message: "You can only select up to 3 genres.",
        };
      }

      // Create user
      const user = await User.create({ username, email, password });

      // Optional: validate if genres exist in DB
      const foundGenres = await Genre.findAll({
        where: {
          id: genres,
        },
      });

      if (foundGenres.length !== genres.length) {
        throw { name: "BadRequest", message: "Some genre IDs are invalid." };
      }

      // Associate genres
      await user.addGenres(genres); // Sequelize M:N

      res.status(201).json({
        message: "User registered successfully",
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }

      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const isPasswordMatch = comparePassword(password, user.password);
      if (!isPasswordMatch) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const access_token = signToken({ id: user.id });

      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }
};
