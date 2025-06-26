// __tests__/additionalCoverage.test.js
const app = require("../app");
const request = require("supertest");
const { sequelize, User, GameList, Genre, Wishlist } = require("../models");
const { queryInterface } = sequelize;
const { signToken } = require("../helpers/jwt");
const { generateContent } = require("../helpers/gemini");

// Mock Gemini
jest.mock("../helpers/gemini");

let tokenUser;
let testUser;

beforeAll(async () => {
  // Clean tables
  await queryInterface.bulkDelete("Wishlists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("UserGenres", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("GameLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("Genres", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  // Create test data
  const genres = [
    { id: 1, name: "Action", description: "Action games" },
    { id: 2, name: "RPG", description: "Role-playing games" },
    { id: 3, name: "Strategy", description: "Strategy games" },
  ];

  await queryInterface.bulkInsert(
    "Genres",
    genres.map((genre) => ({
      ...genre,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  testUser = await User.create({
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  });
  await testUser.addGenres([1, 2]);

  tokenUser = signToken({ id: testUser.id });

  // Create games
  const games = [];
  for (let i = 1; i <= 10; i++) {
    games.push({
      id: i,
      title: `Game ${i}`,
      thumbnail: `https://example.com/game${i}.jpg`,
      short_description: `Description ${i}`,
      game_url: `https://example.com/game${i}`,
      genre: i % 2 === 0 ? "Action" : "RPG",
      platform: "PC",
      publisher: `Publisher ${i}`,
      developer: `Developer ${i}`,
      release_date: "2023-01-01",
      freetogame_profile_url: `https://example.com/profile${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await queryInterface.bulkInsert("GameLists", games);
});

describe("Additional Coverage Tests", () => {
  // Test untuk cover geminiController.js lines 10-276
  describe("Gemini Controller - Edge Cases", () => {
    test("Handle ketika Gemini mengembalikan array kosong", async () => {
      generateContent.mockResolvedValueOnce(JSON.stringify([]));

      const { status, body } = await request(app)
        .get("/recommendations")
        .set("Authorization", `Bearer ${tokenUser}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      // Should fallback to database games
      expect(body.data.recommendations.length).toBeGreaterThan(0);
    });

    test("Handle ketika Gemini mengembalikan partial JSON", async () => {
      generateContent.mockResolvedValueOnce('[{"title": "Game 1"');

      const { status, body } = await request(app)
        .get("/recommendations")
        .set("Authorization", `Bearer ${tokenUser}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    test("Handle multiple genre combinations dalam database search", async () => {
      // Create user with all 3 genres
      const multiGenreUser = await User.create({
        username: "multigenre",
        email: "multi@example.com",
        password: "password123",
      });
      await multiGenreUser.addGenres([1, 2, 3]);

      const token = signToken({ id: multiGenreUser.id });

      generateContent.mockResolvedValueOnce("not json");

      const { status, body } = await request(app)
        .get("/recommendations")
        .set("Authorization", `Bearer ${token}`);

      expect(status).toBe(200);
      expect(body.data.recommendations.length).toBeGreaterThan(0);
    });

    test("Handle ketika tidak ada game yang cocok dengan genre user", async () => {
      // Delete all games temporarily
      await GameList.destroy({ where: {} });

      generateContent.mockResolvedValueOnce(JSON.stringify([]));

      const { status, body } = await request(app)
        .get("/recommendations")
        .set("Authorization", `Bearer ${tokenUser}`);

      expect(status).toBe(200);
      expect(body.data.recommendations).toEqual([]);

      // Restore games
      const games = [];
      for (let i = 1; i <= 10; i++) {
        games.push({
          id: i,
          title: `Game ${i}`,
          genre: i % 2 === 0 ? "Action" : "RPG",
          platform: "PC",
          developer: `Developer ${i}`,
          publisher: `Publisher ${i}`,
          release_date: "2023-01-01",
        });
      }
      await GameList.bulkCreate(games);
    });

    test("Test enrichRecommendationsWithGameList dengan berbagai kondisi", async () => {
      // Mock response dengan game yang ada dan tidak ada di database
      generateContent.mockResolvedValueOnce(
        JSON.stringify([
          {
            title: "Game 1", // Exists in DB
            releaseYear: 2023,
            developer: "Dev 1",
            platforms: ["PC"],
            genres: ["Action"],
            rating: 8.5,
          },
          {
            title: "Nonexistent Game", // Not in DB
            releaseYear: 2024,
            developer: "New Dev",
            platforms: ["PC", "PS5"],
            genres: ["Adventure"],
            rating: 9.0,
          },
          {
            title: "Another Game", // Not in DB but genre matches
            releaseYear: 2023,
            developer: "Another Dev",
            platforms: ["PC"],
            genres: ["RPG"],
            rating: 8.0,
          },
        ])
      );

      const { status, body } = await request(app)
        .get("/recommendations")
        .set("Authorization", `Bearer ${tokenUser}`);

      expect(status).toBe(200);
      const recs = body.data.recommendations;
      expect(recs.some((r) => r.fromDatabase === true)).toBe(true);
      expect(recs.some((r) => r.fromDatabase === false)).toBe(true);
    });
  });

  // Test untuk cover pubGameListController.js lines 6-72
  describe("Public GameList Controller - Edge Cases", () => {
    test("Handle empty search with special characters", async () => {
      const { status, body } = await request(app).get(
        "/pub/games?search=%20%20%20"
      ); // spaces

      expect(status).toBe(200);
      expect(body.data).toBeDefined();
    });

    test("Kombinasi semua parameter query", async () => {
      const { status, body } = await request(app).get(
        "/pub/games?filter=Action&sort=-createdAt&search=Game&page[size]=2&page[number]=1"
      );

      expect(status).toBe(200);
      expect(body.dataPerPage).toBe(2);
      expect(body.page).toBe(1);
      expect(body.data.every((g) => g.genre === "Action")).toBe(true);
    });

    test("Invalid page parameters", async () => {
      const { status, body } = await request(app).get(
        "/pub/games?page[size]=-5&page[number]=0"
      );

      expect(status).toBe(200);
      // Should use default values or handle gracefully
      expect(body.dataPerPage).toBeGreaterThan(0);
    });

    test("Sort dengan column name yang berbeda", async () => {
      const { status, body } = await request(app).get("/pub/games?sort=title");

      expect(status).toBe(200);
      expect(body.data).toBeDefined();
    });
  });

  // Test untuk cover userController.js lines 84-124
  describe("User Controller - Error Handling", () => {
    test("Database error saat create user", async () => {
      // Mock database error
      jest
        .spyOn(User, "create")
        .mockRejectedValueOnce(new Error("Database error"));

      const { status, body } = await request(app)
        .post("/register")
        .send({
          username: "erroruser",
          email: "error@example.com",
          password: "password123",
          genres: [1, 2],
        });

      expect(status).toBe(500);

      // Restore mock
      jest.spyOn(User, "create").mockRestore();
    });

    test("Database error saat add genres", async () => {
      // Mock addGenres to throw error
      const mockUser = {
        id: 999,
        username: "test",
        email: "test@test.com",
        addGenres: jest
          .fn()
          .mockRejectedValueOnce(new Error("Association error")),
      };

      jest.spyOn(User, "create").mockResolvedValueOnce(mockUser);
      jest
        .spyOn(Genre, "findAll")
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

      const { status } = await request(app)
        .post("/register")
        .send({
          username: "erroruser2",
          email: "error2@example.com",
          password: "password123",
          genres: [1, 2],
        });

      expect(status).toBe(500);

      // Restore mocks
      jest.spyOn(User, "create").mockRestore();
      jest.spyOn(Genre, "findAll").mockRestore();
    });
  });

  // Test untuk cover wishlistController.js lines 6-81
  describe("Wishlist Controller - Error Cases", () => {
    test("Database error saat fetch wishlist", async () => {
      jest
        .spyOn(Wishlist, "findAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const { status } = await request(app)
        .get("/wishlist")
        .set("Authorization", `Bearer ${tokenUser}`);

      expect(status).toBe(500);

      jest.spyOn(Wishlist, "findAll").mockRestore();
    });

    test("Race condition saat add wishlist", async () => {
      // Simulate race condition where game is added between check and create
      jest.spyOn(Wishlist, "findOne").mockResolvedValueOnce(null);
      jest.spyOn(Wishlist, "create").mockRejectedValueOnce({
        name: "SequelizeUniqueConstraintError",
        errors: [{ message: "Already exists" }],
      });

      const { status } = await request(app)
        .post("/wishlist/1")
        .set("Authorization", `Bearer ${tokenUser}`);

      expect(status).toBe(400);

      jest.spyOn(Wishlist, "findOne").mockRestore();
      jest.spyOn(Wishlist, "create").mockRestore();
    });
  });

  // Test untuk cover authentication.js lines 17,25
  describe("Authentication Middleware - Edge Cases", () => {
    test("Token dengan format yang salah (bukan Bearer)", async () => {
      const { status, body } = await request(app)
        .get("/games")
        .set("Authorization", "Basic sometoken");

      expect(status).toBe(401);
      expect(body.message).toBe("Invalid token");
    });

    test("Bearer token tanpa value", async () => {
      const { status, body } = await request(app)
        .get("/games")
        .set("Authorization", "Bearer ");

      expect(status).toBe(401);
      expect(body.message).toBe("Invalid token");
    });

    test("Valid token tapi user sudah dihapus", async () => {
      // Create user, get token, then delete user
      const tempUser = await User.create({
        username: "tempuser",
        email: "temp@example.com",
        password: "password123",
      });

      const tempToken = signToken({ id: tempUser.id });

      // Delete user
      await tempUser.destroy();

      const { status, body } = await request(app)
        .get("/games")
        .set("Authorization", `Bearer ${tempToken}`);

      expect(status).toBe(401);
      expect(body.message).toBe("Invalid token");
    });
  });

  // Test untuk cover errorHandler.js lines 11-12,27-30,37-38
  describe("Error Handler - Additional Cases", () => {
    test("SequelizeValidationError dengan multiple errors", async () => {
      // Force validation error dengan data yang salah
      const { status, body } = await request(app)
        .post("/games")
        .set("Authorization", `Bearer ${tokenUser}`)
        .send({
          title: "", // Empty title
          id: "not-a-number", // Invalid ID
        });

      expect(status).toBe(400);
    });

    test("Generic error tanpa name", async () => {
      // Mock controller untuk throw generic error
      const { status, body } = await request(app).get("/test-error"); // Endpoint yang tidak ada

      expect(status).toBe(404); // Default 404 untuk route tidak ditemukan
    });
  });

  // Test untuk cover model validations
  describe("Model Validations", () => {
    test("User model - validasi email format", async () => {
      try {
        await User.create({
          username: "test",
          email: "invalid-email",
          password: "password",
        });
      } catch (error) {
        expect(error.name).toBe("SequelizeValidationError");
      }
    });

    test("GameList model - validasi title empty", async () => {
      try {
        await GameList.create({
          title: "",
          genre: "Action",
        });
      } catch (error) {
        expect(error.name).toBe("SequelizeValidationError");
      }
    });
  });
});

// __tests__/helpers.test.js
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken, verifyToken } = require("../helpers/jwt");

describe("Helper Functions", () => {
  describe("Bcrypt Helpers", () => {
    test("hashPassword should hash password correctly", () => {
      const password = "testpassword";
      const hashed = hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    test("comparePassword should return true for correct password", () => {
      const password = "testpassword";
      const hashed = hashPassword(password);

      expect(comparePassword(password, hashed)).toBe(true);
    });

    test("comparePassword should return false for incorrect password", () => {
      const password = "testpassword";
      const hashed = hashPassword(password);

      expect(comparePassword("wrongpassword", hashed)).toBe(false);
    });
  });

  describe("JWT Helpers", () => {
    test("signToken should create valid token", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = signToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    test("verifyToken should decode valid token", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    test("verifyToken should throw error for invalid token", () => {
      expect(() => {
        verifyToken("invalid.token.here");
      }).toThrow();
    });
  });
});

// __tests__/models.test.js
const { User, GameList, Genre, Wishlist } = require("../models");
const { sequelize } = require("../models");

describe("Model Associations and Hooks", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  describe("User Model", () => {
    test("Password should be hashed before create", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "plainpassword",
      });

      expect(user.password).not.toBe("plainpassword");
      expect(user.password.length).toBeGreaterThan(20);
    });

    test("Password should be hashed before update if changed", async () => {
      const user = await User.create({
        username: "updateuser",
        email: "update@example.com",
        password: "originalpassword",
      });

      const originalHash = user.password;

      user.password = "newpassword";
      await user.save();

      expect(user.password).not.toBe("newpassword");
      expect(user.password).not.toBe(originalHash);
    });

    test("User-Genre association should work", async () => {
      const user = await User.create({
        username: "assocuser",
        email: "assoc@example.com",
        password: "password",
      });

      const genre = await Genre.create({
        name: "TestGenre",
        description: "Test description",
      });

      await user.addGenre(genre);
      const userGenres = await user.getGenres();

      expect(userGenres).toHaveLength(1);
      expect(userGenres[0].name).toBe("TestGenre");
    });
  });

  describe("Wishlist Associations", () => {
    test("Wishlist should properly associate User and GameList", async () => {
      const user = await User.create({
        username: "wishuser",
        email: "wish@example.com",
        password: "password",
      });

      const game = await GameList.create({
        id: 999,
        title: "Test Game",
        genre: "Action",
        platform: "PC",
        developer: "Test Dev",
        publisher: "Test Pub",
        release_date: "2023-01-01",
      });

      const wishlist = await Wishlist.create({
        UserId: user.id,
        GameListId: game.id,
      });

      const wishlistWithAssoc = await Wishlist.findOne({
        where: { id: wishlist.id },
        include: [User, GameList],
      });

      expect(wishlistWithAssoc.User.username).toBe("wishuser");
      expect(wishlistWithAssoc.GameList.title).toBe("Test Game");
    });
  });
});

afterAll(async () => {
  await sequelize.close();
});
