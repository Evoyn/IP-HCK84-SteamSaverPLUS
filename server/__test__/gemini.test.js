const app = require("../app");
const request = require("supertest");
const { sequelize, User, GameList, Genre } = require("../models");
const { queryInterface } = sequelize;
const { signToken } = require("../helpers/jwt");
const { generateContent } = require("../helpers/gemini");

// Mock the Gemini helper module
jest.mock("../helpers/gemini");

// Test data
const testUsers = [
  {
    id: 1,
    username: "gamer1",
    email: "gamer1@test.com",
    password: "password123",
  },
  {
    id: 2,
    username: "gamer2",
    email: "gamer2@test.com",
    password: "password456",
  },
  {
    id: 3,
    username: "nogamesgamer",
    email: "nogames@test.com",
    password: "password789",
  },
];

const testGenres = [
  {
    id: 1,
    name: "Action",
    description: "Fast-paced games with combat and excitement",
  },
  {
    id: 2,
    name: "RPG",
    description: "Role-playing games with character development",
  },
  {
    id: 3,
    name: "Strategy",
    description: "Games requiring tactical thinking and planning",
  },
  {
    id: 4,
    name: "Shooter",
    description: "First or third person shooting games",
  },
  {
    id: 5,
    name: "MMORPG",
    description: "Massively multiplayer online role-playing games",
  },
];

const testGames = [
  {
    id: 1,
    title: "Warframe",
    thumbnail: "https://www.freetogame.com/g/1/thumbnail.jpg",
    short_description: "A cooperative free-to-play online action game",
    game_url: "https://www.freetogame.com/open/warframe",
    genre: "Action",
    platform: "PC (Windows)",
    publisher: "Digital Extremes",
    developer: "Digital Extremes",
    release_date: "2013-03-25",
    freetogame_profile_url: "https://www.freetogame.com/warframe",
  },
  {
    id: 2,
    title: "Genshin Impact",
    thumbnail: "https://www.freetogame.com/g/2/thumbnail.jpg",
    short_description: "An open-world action RPG with gacha mechanics",
    game_url: "https://www.freetogame.com/open/genshin-impact",
    genre: "RPG",
    platform: "PC (Windows)",
    publisher: "miHoYo",
    developer: "miHoYo",
    release_date: "2020-09-28",
    freetogame_profile_url: "https://www.freetogame.com/genshin-impact",
  },
  {
    id: 3,
    title: "League of Legends",
    thumbnail: "https://www.freetogame.com/g/3/thumbnail.jpg",
    short_description: "A popular MOBA game",
    game_url: "https://www.freetogame.com/open/league-of-legends",
    genre: "Strategy",
    platform: "PC (Windows)",
    publisher: "Riot Games",
    developer: "Riot Games",
    release_date: "2009-10-27",
    freetogame_profile_url: "https://www.freetogame.com/league-of-legends",
  },
  {
    id: 4,
    title: "Valorant",
    thumbnail: "https://www.freetogame.com/g/4/thumbnail.jpg",
    short_description: "A tactical 5v5 character-based shooter",
    game_url: "https://www.freetogame.com/open/valorant",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Riot Games",
    developer: "Riot Games",
    release_date: "2020-06-02",
    freetogame_profile_url: "https://www.freetogame.com/valorant",
  },
  {
    id: 5,
    title: "Path of Exile",
    thumbnail: "https://www.freetogame.com/g/5/thumbnail.jpg",
    short_description: "A free-to-play action RPG",
    game_url: "https://www.freetogame.com/open/path-of-exile",
    genre: "RPG",
    platform: "PC (Windows)",
    publisher: "Grinding Gear Games",
    developer: "Grinding Gear Games",
    release_date: "2013-10-23",
    freetogame_profile_url: "https://www.freetogame.com/path-of-exile",
  },
  {
    id: 6,
    title: "World of Warcraft",
    thumbnail: "https://www.freetogame.com/g/6/thumbnail.jpg",
    short_description: "The most popular MMORPG",
    game_url: "https://www.freetogame.com/open/world-of-warcraft",
    genre: "MMORPG",
    platform: "PC (Windows)",
    publisher: "Blizzard",
    developer: "Blizzard",
    release_date: "2004-11-23",
    freetogame_profile_url: "https://www.freetogame.com/world-of-warcraft",
  },
];

// Mock Gemini responses
const mockGeminiResponses = {
  valid: `Based on your preferences, here are my recommendations:

[
  {
    "title": "Apex Legends",
    "releaseYear": 2019,
    "developer": "Respawn Entertainment",
    "platforms": ["PC", "PS4", "Xbox One"],
    "genres": ["Shooter", "Battle Royale"],
    "rating": 8.5
  },
  {
    "title": "Destiny 2",
    "releaseYear": 2017,
    "developer": "Bungie",
    "platforms": ["PC", "PS4", "Xbox One"],
    "genres": ["Shooter", "RPG"],
    "rating": 8.0
  },
  {
    "title": "Warframe",
    "releaseYear": 2013,
    "developer": "Digital Extremes",
    "platforms": ["PC", "PS4", "Xbox One", "Switch"],
    "genres": ["Action", "Shooter"],
    "rating": 8.2
  },
  {
    "title": "Path of Exile",
    "releaseYear": 2013,
    "developer": "Grinding Gear Games",
    "platforms": ["PC", "PS4", "Xbox One"],
    "genres": ["RPG", "Action"],
    "rating": 8.8
  },
  {
    "title": "Guild Wars 2",
    "releaseYear": 2012,
    "developer": "ArenaNet",
    "platforms": ["PC"],
    "genres": ["MMORPG", "RPG"],
    "rating": 8.3
  },
  {
    "title": "Paladins",
    "releaseYear": 2018,
    "developer": "Hi-Rez Studios",
    "platforms": ["PC", "PS4", "Xbox One", "Switch"],
    "genres": ["Shooter", "Hero Shooter"],
    "rating": 7.5
  }
]`,

  malformed: `Here are some great games for you:

I recommend trying Apex Legends and Warframe. They're both excellent free-to-play games!`,

  invalidJson: `[
    {
      "title": "Apex Legends",
      "releaseYear": 2019,
      // Invalid JSON comment
      "developer": "Respawn",
    }
  ]`,

  empty: `[]`,
};

// Helper functions
const createAuthToken = (userId) => signToken({ id: userId });

const authRequest = (method, url, token) => {
  return request(app)[method](url).set("Authorization", `Bearer ${token}`);
};

beforeAll(async () => {
  // Clean up tables
  await queryInterface.bulkDelete("UserGenres", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("Genres", null, {
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

  // Insert test data
  await User.bulkCreate(testUsers);

  await queryInterface.bulkInsert(
    "Genres",
    testGenres.map((genre) => ({
      ...genre,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  await queryInterface.bulkInsert(
    "GameLists",
    testGames.map((game) => ({
      ...game,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  // Set up user-genre relationships
  await queryInterface.bulkInsert("UserGenres", [
    { UserId: 1, GenreId: 1, createdAt: new Date(), updatedAt: new Date() }, // User 1 likes Action
    { UserId: 1, GenreId: 4, createdAt: new Date(), updatedAt: new Date() }, // User 1 likes Shooter
    { UserId: 2, GenreId: 2, createdAt: new Date(), updatedAt: new Date() }, // User 2 likes RPG
    { UserId: 2, GenreId: 5, createdAt: new Date(), updatedAt: new Date() }, // User 2 likes MMORPG
    // User 3 has no favorite genres
  ]);
});

describe("Game Recommendations API - /recommendations", () => {
  let user1Token, user2Token, user3Token;

  beforeAll(() => {
    user1Token = createAuthToken(1);
    user2Token = createAuthToken(2);
    user3Token = createAuthToken(3);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    test("Should return 401 when no auth token provided", async () => {
      const { status, body } = await request(app).get("/recommendations");

      expect(status).toBe(401);
      expect(body).toHaveProperty("message", "Invalid token");
    });

    test("Should return 401 with invalid token", async () => {
      const { status, body } = await request(app)
        .get("/recommendations")
        .set("Authorization", "Bearer invalid.token.here");

      expect(status).toBe(401);
      expect(body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Successful Recommendations", () => {
    test("Should return recommendations for user with favorite genres", async () => {
      // Mock Gemini to return valid response
      generateContent.mockResolvedValueOnce(mockGeminiResponses.valid);

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(200);
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("userId", 1);
      expect(body.data).toHaveProperty("favoriteGenres");
      expect(body.data.favoriteGenres).toEqual(["Action", "Shooter"]);
      expect(body.data).toHaveProperty("recommendations");
      expect(Array.isArray(body.data.recommendations)).toBe(true);

      // Verify Gemini was called with correct prompt
      expect(generateContent).toHaveBeenCalledTimes(1);
      const promptArg = generateContent.mock.calls[0][0];
      expect(promptArg).toContain("Action, Shooter");
    });

    test("Should enrich recommendations with database data when available", async () => {
      generateContent.mockResolvedValueOnce(mockGeminiResponses.valid);

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(200);

      // Find Warframe in recommendations (it exists in both Gemini response and DB)
      const warframeRec = body.data.recommendations.find(
        (r) => r.title === "Warframe"
      );
      expect(warframeRec).toBeDefined();
      expect(warframeRec).toHaveProperty("fromDatabase", true);
      expect(warframeRec).toHaveProperty("id", 1);
      expect(warframeRec).toHaveProperty("thumbnail");
      expect(warframeRec).toHaveProperty("game_url");
    });

    test("Should return different recommendations for users with different genres", async () => {
      generateContent.mockResolvedValueOnce(mockGeminiResponses.valid);

      const { body: user2Body } = await authRequest(
        "get",
        "/recommendations",
        user2Token
      );

      expect(user2Body.data.favoriteGenres).toEqual(["RPG", "MMORPG"]);
      expect(user2Body.data.recommendations.length).toBeGreaterThan(0);

      // Verify prompt contains user's specific genres
      const promptArg = generateContent.mock.calls[0][0];
      expect(promptArg).toContain("RPG, MMORPG");
    });
  });

  describe("Error Handling", () => {
    test("Should return 404 when user has no favorite genres", async () => {
      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user3Token
      );

      expect(status).toBe(404);
      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty(
        "message",
        "No favorite genres found for user"
      );
    });

    test("Should handle Gemini API errors gracefully", async () => {
      generateContent.mockRejectedValueOnce(
        new Error("Gemini API rate limit exceeded")
      );

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(500);
      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty(
        "message",
        "Failed to generate game recommendations"
      );

      // In development, error message should be included
      if (process.env.NODE_ENV === "development") {
        expect(body).toHaveProperty("error", "Gemini API rate limit exceeded");
      }
    });

    test("Should handle malformed Gemini responses", async () => {
      generateContent.mockResolvedValueOnce(mockGeminiResponses.malformed);

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(200);
      expect(body).toHaveProperty("success", true);

      // Should fall back to database games
      expect(body.data.recommendations.length).toBeGreaterThan(0);
      expect(body.data.recommendations.every((r) => r.fromDatabase)).toBe(true);
    });

    test("Should handle invalid JSON in Gemini response", async () => {
      generateContent.mockResolvedValueOnce(mockGeminiResponses.invalidJson);

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(200);

      // Should fall back to database games
      expect(body.data.recommendations.length).toBeGreaterThan(0);
      expect(body.data.recommendations.every((r) => r.fromDatabase)).toBe(true);
    });

    test("Should handle empty recommendations from Gemini", async () => {
      generateContent.mockResolvedValueOnce(mockGeminiResponses.empty);

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(200);

      // Should fall back to database games
      expect(body.data.recommendations.length).toBeGreaterThan(0);
      expect(body.data.recommendations.every((r) => r.fromDatabase)).toBe(true);
    });
  });

  describe("Database Fallback Behavior", () => {
    test("Should return games from database when Gemini fails", async () => {
      generateContent.mockRejectedValueOnce(new Error("API Error"));

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(500);
    });

    test("Should match games by genre from database", async () => {
      // Mock Gemini to return games not in database
      const customResponse = `[
        {
          "title": "Nonexistent Game",
          "releaseYear": 2023,
          "developer": "Unknown",
          "platforms": ["PC"],
          "genres": ["Action"],
          "rating": 7.0
        }
      ]`;
      generateContent.mockResolvedValueOnce(customResponse);

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(200);

      // Should include database games matching user's genres
      const dbGames = body.data.recommendations.filter((r) => r.fromDatabase);
      expect(dbGames.length).toBeGreaterThan(0);

      // Check that returned games match user's favorite genres
      const userGenres = ["Action", "Shooter"];
      dbGames.forEach((game) => {
        expect(userGenres.some((genre) => game.genre.includes(genre))).toBe(
          true
        );
      });
    });

    test("Should limit recommendations to requested amount", async () => {
      generateContent.mockResolvedValueOnce(mockGeminiResponses.valid);

      const { status, body } = await authRequest(
        "get",
        "/recommendations",
        user2Token
      );

      expect(status).toBe(200);

      // Should have reasonable number of recommendations
      expect(body.data.recommendations.length).toBeGreaterThan(0);
      expect(body.data.recommendations.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Edge Cases", () => {
    test("Should handle special characters in genre names", async () => {
      // Add genre with special characters
      await queryInterface.bulkInsert("Genres", [
        {
          id: 10,
          name: "Sci-Fi & Fantasy",
          description: "Science fiction and fantasy games",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      await queryInterface.bulkInsert("UserGenres", [
        {
          UserId: 1,
          GenreId: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      generateContent.mockResolvedValueOnce(mockGeminiResponses.valid);

      const { status } = await authRequest(
        "get",
        "/recommendations",
        user1Token
      );

      expect(status).toBe(200);
      expect(generateContent).toHaveBeenCalled();
    });

    test("Should handle concurrent requests from same user", async () => {
      generateContent.mockResolvedValue(mockGeminiResponses.valid);

      const promises = [
        authRequest("get", "/recommendations", user1Token),
        authRequest("get", "/recommendations", user1Token),
        authRequest("get", "/recommendations", user1Token),
      ];

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("success", true);
      });

      expect(generateContent).toHaveBeenCalledTimes(3);
    });
  });

  describe("Response Format Validation", () => {
    test("Should return properly formatted recommendation objects", async () => {
      generateContent.mockResolvedValueOnce(mockGeminiResponses.valid);

      const { body } = await authRequest("get", "/recommendations", user1Token);

      const recommendations = body.data.recommendations;
      recommendations.forEach((rec) => {
        if (rec.fromDatabase) {
          expect(rec).toHaveProperty("id");
          expect(rec).toHaveProperty("title");
          expect(rec).toHaveProperty("thumbnail");
          expect(rec).toHaveProperty("game_url");
          expect(rec).toHaveProperty("genre");
          expect(rec).toHaveProperty("platform");
          expect(rec).toHaveProperty("publisher");
          expect(rec).toHaveProperty("developer");
          expect(rec).toHaveProperty("release_date");
          expect(rec).toHaveProperty("freetogame_profile_url");
        } else {
          expect(rec).toHaveProperty("title");
          expect(rec).toHaveProperty("releaseYear");
          expect(rec).toHaveProperty("developer");
          expect(rec).toHaveProperty("platforms");
          expect(rec).toHaveProperty("genres");
          expect(rec).toHaveProperty("rating");
        }
      });
    });
  });
});

afterAll(async () => {
  // Clean up
  await queryInterface.bulkDelete("UserGenres", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await queryInterface.bulkDelete("Genres", null, {
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
