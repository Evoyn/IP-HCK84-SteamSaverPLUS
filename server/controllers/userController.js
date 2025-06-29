const { User, Genre } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password, genres } = req.body;

      if (!username) {
        throw { name: "BadRequest", message: "Username is required" };
      }

      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }

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

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email must be unique" });
      }

      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ message: "Username must be unique" });
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

  static async googleLogin(req, res, next) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: req.body.googleToken,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the WEB_CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
      });
      console.log("TICKET:", ticket);

      const payload = ticket.getPayload();
      console.log("Google login payload:", payload);
      const userid = payload["sub"];
      // If the request specified a Google Workspace domain:
      // const domain = payload['hd'];

      let user = await User.findOne({
        where: { email: payload.email },
      });

      if (!user) {
        // If user does not exist, create a new one
        user = await User.create({
          username: payload.name + " " + Math.random().toString(36).slice(-5), // Ensure unique username
          email: payload.email,
          password: Math.random().toString(36).slice(-8),
        });

        function getRandomGenres(count) {
          const nums = Array.from({ length: 18 }, (_, i) => i + 1);
          const shuffled = nums.sort(() => Math.random() - 0.5);
          return shuffled.slice(0, count);
        }

        const randomGenres = getRandomGenres(3);

        await user.addGenres(randomGenres); // Add default genres or handle as needed
      }

      const access_token = signToken({ id: user.id });

      res.status(200).json({ Login: "Google login successful", access_token });
    } catch (err) {
      console.log("GOOGLE LOGIN ERROR:", err);
      next(err);
    }
  }
};
