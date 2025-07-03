const app = require("../app");
const request = require("supertest");
const { sequelize, User, GameList, Wishlist } = require("../models");
const { queryInterface } = sequelize;
const { signToken } = require("../helpers/jwt");
const { hashPassword } = require("../helpers/bcrypt");

// Test data
const testUsers = [
  {
    id: 1,
    username: "testuser1",
    email: "test1@example.com",
    password: "password123", // Will be hashed by the model hook
  },
  {
    id: 2,
    username: "testuser2",
    email: "test2@example.com",
    password: "password456",
  },
];

const testGames = [
  {
    id: 1,
    title: "The Witcher 3",
    thumbnail: "https://example.com/witcher3.jpg",
    short_description: "An open world RPG",
    game_url: "https://example.com/witcher3",
    genre: "RPG",
    platform: "PC (Windows)",
    publisher: "CD Projekt",
    developer: "CD Projekt Red",
    release_date: "2015-05-19",
    freetogame_profile_url: "https://example.com/witcher3-profile",
  },
  {
    id: 2,
    title: "Portal 2",
    thumbnail: "https://example.com/portal2.jpg",
    short_description: "A puzzle platform game",
    game_url: "https://example.com/portal2",
    genre: "Puzzle",
    platform: "PC (Windows)",
    publisher: "Valve",
    developer: "Valve",
    release_date: "2011-04-19",
    freetogame_profile_url: "https://example.com/portal2-profile",
  },
  {
    id: 3,
    title: "Hades",
    thumbnail: "https://example.com/hades.jpg",
    short_description: "A rogue-like dungeon crawler",
    game_url: "https://example.com/hades",
    genre: "Action",
    platform: "PC (Windows)",
    publisher: "Supergiant Games",
    developer: "Supergiant Games",
    release_date: "2020-09-17",
    freetogame_profile_url: "https://example.com/hades-profile",
  },
];

// Helper function to create auth token
const createAuthToken = (userId) => {
  return signToken({ id: userId });
};

// Helper function to create authenticated request
const authRequest = (method, url, token) => {
  return request(app)[method](url).set("Authorization", `Bearer ${token}`);
};

beforeAll(async () => {
  // Clean up tables
  await queryInterface.bulkDelete("Wishlists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("GameLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  // Insert test users (password will be hashed by model hook)
  await User.bulkCreate(testUsers);

  // Insert test games
  await queryInterface.bulkInsert(
    "GameLists",
    testGames.map((game) => ({
      ...game,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
});

describe("Wishlist API - /wishlist", () => {
  let userToken;
  let user2Token;

  beforeAll(() => {
    // Create tokens for test users
    userToken = createAuthToken(1);
    user2Token = createAuthToken(2);
  });

  beforeEach(async () => {
    // Clean wishlist before each test
    await queryInterface.bulkDelete("Wishlists", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  });

  describe("Authentication Requirements", () => {
    test("Should return 401 when no authorization header", async () => {
      const { status, body } = await request(app).get("/wishlist");

      expect(status).toBe(401);
      expect(body).toHaveProperty("message", "Invalid token");
    });

    test("Should return 401 when invalid token format", async () => {
      const { status, body } = await request(app)
        .get("/wishlist")
        .set("Authorization", "InvalidFormat");

      expect(status).toBe(401);
      expect(body).toHaveProperty("message", "Invalid token");
    });

    test("Should return 401 when Bearer token is missing", async () => {
      const { status, body } = await request(app)
        .get("/wishlist")
        .set("Authorization", "Bearer");

      expect(status).toBe(401);
      expect(body).toHaveProperty("message", "Invalid token");
    });

    test("Should return 401 when token is invalid", async () => {
      const { status, body } = await request(app)
        .get("/wishlist")
        .set("Authorization", "Bearer invalid.token.here");

      expect(status).toBe(401);
      expect(body).toHaveProperty("message", "Invalid token");
    });

    test("Should return 401 when user doesn't exist", async () => {
      const fakeToken = signToken({ id: 9999 });
      const { status, body } = await request(app)
        .get("/wishlist")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(status).toBe(401);
      expect(body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("GET /wishlist - Get User's Wishlist", () => {
    test("Should return empty array when user has no wishlisted games", async () => {
      const { status, body } = await authRequest("get", "/wishlist", userToken);

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(0);
    });

    test("Should return wishlisted games with game details", async () => {
      // Add games to wishlist
      await Wishlist.bulkCreate([
        { UserId: 1, GameListId: 1 },
        { UserId: 1, GameListId: 2 },
      ]);

      const { status, body } = await authRequest("get", "/wishlist", userToken);

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(2);

      // Check structure
      expect(body[0]).toHaveProperty("UserId", 1);
      expect(body[0]).toHaveProperty("GameListId");
      expect(body[0]).toHaveProperty("GameList");
      expect(body[0].GameList).toHaveProperty("id");
      expect(body[0].GameList).toHaveProperty("title");
      expect(body[0].GameList).toHaveProperty("genre");
    });

    test("Should only return current user's wishlist", async () => {
      // Add games for different users
      await Wishlist.bulkCreate([
        { UserId: 1, GameListId: 1 },
        { UserId: 1, GameListId: 2 },
        { UserId: 2, GameListId: 2 },
        { UserId: 2, GameListId: 3 },
      ]);

      // User 1 should only see their games
      const { body: user1Wishlist } = await authRequest(
        "get",
        "/wishlist",
        userToken
      );
      expect(user1Wishlist).toHaveLength(2);
      expect(user1Wishlist.every((w) => w.UserId === 1)).toBe(true);

      // User 2 should only see their games
      const { body: user2Wishlist } = await authRequest(
        "get",
        "/wishlist",
        user2Token
      );
      expect(user2Wishlist).toHaveLength(2);
      expect(user2Wishlist.every((w) => w.UserId === 2)).toBe(true);
    });

    test("Should include full game details in response", async () => {
      await Wishlist.create({ UserId: 1, GameListId: 1 });

      const { status, body } = await authRequest("get", "/wishlist", userToken);

      expect(status).toBe(200);
      expect(body[0].GameList).toMatchObject({
        id: 1,
        title: "The Witcher 3",
        genre: "RPG",
        platform: "PC (Windows)",
        publisher: "CD Projekt",
        developer: "CD Projekt Red",
      });
    });
  });

  describe("POST /wishlist/:gameId - Add Game to Wishlist", () => {
    test("Should successfully add game to wishlist", async () => {
      const { status, body } = await authRequest(
        "post",
        "/wishlist/1",
        userToken
      );

      expect(status).toBe(201);
      expect(body).toHaveProperty("message", "Game added to wishlist");
      expect(body).toHaveProperty("wishlist");
      expect(body.wishlist).toHaveProperty("UserId", 1);
      expect(body.wishlist).toHaveProperty("GameListId", 1);

      // Verify in database
      const count = await Wishlist.count({
        where: { UserId: 1, GameListId: 1 },
      });
      expect(count).toBe(1);
    });

    test("Should return 404 when game doesn't exist", async () => {
      const { status, body } = await authRequest(
        "post",
        "/wishlist/9999",
        userToken
      );

      expect(status).toBe(404);
      expect(body).toHaveProperty("message", "Resource not found");
    });

    test("Should return 400 when game already in wishlist", async () => {
      // Add game to wishlist
      await Wishlist.create({ UserId: 1, GameListId: 1 });

      // Try to add again
      const { status, body } = await authRequest(
        "post",
        "/wishlist/1",
        userToken
      );

      expect(status).toBe(400);
      expect(body).toHaveProperty(
        "message",
        "You already have this game in your wishlist"
      );
    });

    test("Should allow different users to wishlist same game", async () => {
      // User 1 adds game
      const { status: status1 } = await authRequest(
        "post",
        "/wishlist/1",
        userToken
      );
      expect(status1).toBe(201);

      // User 2 adds same game
      const { status: status2 } = await authRequest(
        "post",
        "/wishlist/1",
        user2Token
      );
      expect(status2).toBe(201);

      // Verify both entries exist
      const count = await Wishlist.count({ where: { GameListId: 1 } });
      expect(count).toBe(2);
    });
  });

  describe("DELETE /wishlist/:gameId - Remove Game from Wishlist", () => {
    beforeEach(async () => {
      // Add some games to wishlist for testing
      await Wishlist.bulkCreate([
        { UserId: 1, GameListId: 1 },
        { UserId: 1, GameListId: 2 },
        { UserId: 2, GameListId: 1 },
      ]);
    });

    test("Should successfully remove game from wishlist", async () => {
      const { status, body } = await authRequest(
        "delete",
        "/wishlist/1",
        userToken
      );

      expect(status).toBe(200);
      expect(body).toHaveProperty("message", "Game removed from wishlist");

      // Verify removed from database
      const count = await Wishlist.count({
        where: { UserId: 1, GameListId: 1 },
      });
      expect(count).toBe(0);

      // Other user's wishlist should not be affected
      const user2Count = await Wishlist.count({
        where: { UserId: 2, GameListId: 1 },
      });
      expect(user2Count).toBe(1);
    });

    test("Should return 404 when game not in wishlist", async () => {
      const { status, body } = await authRequest(
        "delete",
        "/wishlist/3",
        userToken
      );

      expect(status).toBe(404);
      expect(body).toHaveProperty("message", "Resource not found");
    });

    test("Should only remove from current user's wishlist", async () => {
      // User 2 tries to remove game that's only in User 1's wishlist
      const { status, body } = await authRequest(
        "delete",
        "/wishlist/2",
        user2Token
      );

      expect(status).toBe(404);
      expect(body).toHaveProperty("message", "Resource not found");

      // Verify User 1's wishlist still has the game
      const count = await Wishlist.count({
        where: { UserId: 1, GameListId: 2 },
      });
      expect(count).toBe(1);
    });
  });

  describe("Wishlist Workflow - Complete User Journey", () => {
    test("Should handle complete wishlist lifecycle", async () => {
      // 1. Start with empty wishlist
      let response = await authRequest("get", "/wishlist", userToken);
      expect(response.body).toHaveLength(0);

      // 2. Add first game
      response = await authRequest("post", "/wishlist/1", userToken);
      expect(response.status).toBe(201);

      // 3. Add second game
      response = await authRequest("post", "/wishlist/3", userToken);
      expect(response.status).toBe(201);

      // 4. Check wishlist has 2 games
      response = await authRequest("get", "/wishlist", userToken);
      expect(response.body).toHaveLength(2);

      // 5. Try to add duplicate
      response = await authRequest("post", "/wishlist/1", userToken);
      expect(response.status).toBe(400);

      // 6. Remove one game
      response = await authRequest("delete", "/wishlist/1", userToken);
      expect(response.status).toBe(200);

      // 7. Check wishlist has 1 game
      response = await authRequest("get", "/wishlist", userToken);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].GameListId).toBe(3);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("Should handle concurrent wishlist operations", async () => {
      // Simulate multiple simultaneous requests
      const promises = [
        authRequest("post", "/wishlist/1", userToken),
        authRequest("post", "/wishlist/2", userToken),
        authRequest("post", "/wishlist/3", userToken),
      ];

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((res) => {
        expect(res.status).toBe(201);
      });

      // Verify all games were added
      const count = await Wishlist.count({ where: { UserId: 1 } });
      expect(count).toBe(3);
    });
  });
});

afterAll(async () => {
  // Clean up
  await queryInterface.bulkDelete("Wishlists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("GameLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});
