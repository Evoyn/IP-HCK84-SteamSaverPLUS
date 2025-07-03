const { User, Genre } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { Op } = require("sequelize");

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
        throw {
          name: "BadRequest",
          message: "Genre IDs must be numbers between 1 and 18",
        };
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

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params; // User ID from URL params
      const { username, genres } = req.body;

      // Find the user
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      // Check if the logged-in user is updating their own profile
      // Assuming req.user is set by authentication middleware
      if (req.user.id !== parseInt(id)) {
        throw {
          name: "Forbidden",
          message: "You can only update your own profile",
        };
      }

      // Update username if provided
      if (username) {
        // Check if username is already taken by another user
        const existingUsername = await User.findOne({
          where: {
            username,
            id: { [Op.ne]: id }, // Exclude current user
          },
        });
        if (existingUsername) {
          throw { name: "BadRequest", message: "Username is already taken" };
        }

        await user.update({ username });
      }

      // Update genres if provided
      if (genres !== undefined) {
        // Validate genres
        if (!Array.isArray(genres)) {
          throw {
            name: "BadRequest",
            message: "Genres must be an array",
          };
        }

        if (genres.length === 0) {
          throw {
            name: "BadRequest",
            message: "At least 1 genre must be selected",
          };
        }

        if (genres.length > 3) {
          throw {
            name: "BadRequest",
            message: "You can only select up to 3 genres",
          };
        }

        // Validate genre IDs (must be numbers between 1-18)
        const validGenreIds = genres.every(
          (id) => Number.isInteger(id) && id >= 1 && id <= 18
        );

        if (!validGenreIds) {
          throw {
            name: "BadRequest",
            message: "Genre IDs must be numbers between 1 and 18",
          };
        }

        // Verify genres exist in database
        const foundGenres = await Genre.findAll({
          where: {
            id: genres,
          },
        });

        if (foundGenres.length !== genres.length) {
          throw { name: "BadRequest", message: "Some genre IDs are invalid" };
        }

        // Update user's genres (this will replace all existing associations)
        await user.setGenres(genres);
      }

      // Fetch updated user with genres
      const updatedUser = await User.findByPk(id, {
        attributes: ["id", "username", "email"],
        include: [
          {
            model: Genre,
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude junction table attributes
          },
        ],
      });

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        throw { name: "BadRequest", message: "Invalid user ID" };
      }

      // Find user with genres
      const user = await User.findByPk(id, {
        attributes: ["id", "username", "email", "createdAt", "updatedAt"],
        include: [
          {
            model: Genre,
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude junction table attributes
          },
        ],
      });

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      // Check if user is requesting their own profile or is an admin
      // For public profiles, you might want to exclude email
      const isOwnProfile = req.user && req.user.id === parseInt(id);

      // Format response based on access level
      const userResponse = {
        id: user.id,
        username: user.username,
        email: isOwnProfile ? user.email : undefined, // Only show email to profile owner
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        genres: user.Genres || [],
      };

      // Remove undefined fields
      Object.keys(userResponse).forEach(
        (key) => userResponse[key] === undefined && delete userResponse[key]
      );

      res.status(200).json(userResponse);
    } catch (err) {
      next(err);
    }
  }
};
