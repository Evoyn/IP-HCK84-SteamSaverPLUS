const app = require("../app");
const request = require("supertest");
const { sequelize, GameList } = require("../models");
const { queryInterface } = sequelize;

// Mock game data that matches your model structure
const mockGames = [
  {
    id: 1,
    title: "Counter-Strike 2",
    thumbnail: "https://www.freetogame.com/g/1/thumbnail.jpg",
    short_description: "The latest iteration of the classic team-based FPS",
    game_url: "https://www.freetogame.com/open/counter-strike-2",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Valve",
    developer: "Valve",
    release_date: "2023-09-27",
    freetogame_profile_url: "https://www.freetogame.com/counter-strike-2",
  },
  {
    id: 2,
    title: "Dota 2",
    thumbnail: "https://www.freetogame.com/g/2/thumbnail.jpg",
    short_description:
      "A multiplayer online battle arena where you play as heroes",
    game_url: "https://www.freetogame.com/open/dota-2",
    genre: "MOBA",
    platform: "PC (Windows)",
    publisher: "Valve",
    developer: "Valve",
    release_date: "2013-07-09",
    freetogame_profile_url: "https://www.freetogame.com/dota-2",
  },
  {
    id: 3,
    title: "League of Legends",
    thumbnail: "https://www.freetogame.com/g/3/thumbnail.jpg",
    short_description:
      "A fast-paced, competitive online game that blends RPG and strategy",
    game_url: "https://www.freetogame.com/open/league-of-legends",
    genre: "MOBA",
    platform: "PC (Windows)",
    publisher: "Riot Games",
    developer: "Riot Games",
    release_date: "2009-10-27",
    freetogame_profile_url: "https://www.freetogame.com/league-of-legends",
  },
  {
    id: 4,
    title: "Apex Legends",
    thumbnail: "https://www.freetogame.com/g/4/thumbnail.jpg",
    short_description: "A hero-based Battle Royale shooter",
    game_url: "https://www.freetogame.com/open/apex-legends",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Electronic Arts",
    developer: "Respawn Entertainment",
    release_date: "2019-02-04",
    freetogame_profile_url: "https://www.freetogame.com/apex-legends",
  },
  {
    id: 5,
    title: "Fortnite",
    thumbnail: "https://www.freetogame.com/g/5/thumbnail.jpg",
    short_description: "A free-to-play Battle Royale game and so much more",
    game_url: "https://www.freetogame.com/open/fortnite",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Epic Games",
    developer: "Epic Games",
    release_date: "2017-07-25",
    freetogame_profile_url: "https://www.freetogame.com/fortnite",
  },
];

// Generate bulk games for pagination testing
const generateBulkGames = (startId, count) => {
  const games = [];
  const genres = [
    "MMORPG",
    "Shooter",
    "MOBA",
    "Racing",
    "Sports",
    "Strategy",
    "Fighting",
    "Action",
  ];
  const platforms = [
    "PC (Windows)",
    "Web Browser",
    "PC (Windows), Web Browser",
  ];

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    games.push({
      id,
      title: `Test Game ${id}`,
      thumbnail: `https://www.freetogame.com/g/${id}/thumbnail.jpg`,
      short_description: `This is a description for test game ${id}. It's a great game!`,
      game_url: `https://www.freetogame.com/open/test-game-${id}`,
      genre: genres[i % genres.length],
      platform: platforms[i % platforms.length],
      publisher: `Publisher ${i % 10}`,
      developer: `Developer ${i % 8}`,
      release_date: new Date(2020 + (i % 5), i % 12, (i % 28) + 1)
        .toISOString()
        .split("T")[0],
      freetogame_profile_url: `https://www.freetogame.com/test-game-${id}`,
      createdAt: new Date(2024, i % 12, (i % 28) + 1),
      updatedAt: new Date(2024, i % 12, (i % 28) + 1),
    });
  }
  return games;
};

beforeAll(async () => {
  // Clean the GameLists table
  await queryInterface.bulkDelete("GameLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  // Insert test data
  const allGames = [...mockGames, ...generateBulkGames(6, 50)];
  await queryInterface.bulkInsert(
    "GameLists",
    allGames.map((game) => ({
      ...game,
      createdAt: game.createdAt || new Date(),
      updatedAt: game.updatedAt || new Date(),
    }))
  );
});

describe("Public GameList API - /pub-games", () => {
  describe("GET /pub-games - Get All Games", () => {
    describe("Success Cases", () => {
      test("Should return paginated games with default pagination (10 items)", async () => {
        const { status, body } = await request(app).get("/pub-games");

        expect(status).toBe(200);
        expect(body).toHaveProperty("page", 1);
        expect(body).toHaveProperty("data");
        expect(body).toHaveProperty("totalData");
        expect(body).toHaveProperty("totalPage");
        expect(body).toHaveProperty("dataPerPage", 10);

        expect(Array.isArray(body.data)).toBe(true);
        expect(body.dataPerPage).toBe(10);
        expect(body.totalData).toBe(55); // 5 mock games + 50 generated games
        expect(body.totalPage).toBe(6); // Math.ceil(55/10)

        // Validate first game structure
        const game = body.data[0];
        expect(game).toHaveProperty("id", expect.any(Number));
        expect(game).toHaveProperty("title", expect.any(String));
        expect(game).toHaveProperty("thumbnail", expect.any(String));
        expect(game).toHaveProperty("short_description", expect.any(String));
        expect(game).toHaveProperty("game_url", expect.any(String));
        expect(game).toHaveProperty("genre", expect.any(String));
        expect(game).toHaveProperty("platform", expect.any(String));
        expect(game).toHaveProperty("publisher", expect.any(String));
        expect(game).toHaveProperty("developer", expect.any(String));
        expect(game).toHaveProperty("release_date", expect.any(String));
        expect(game).toHaveProperty(
          "freetogame_profile_url",
          expect.any(String)
        );
        expect(game).toHaveProperty("createdAt", expect.any(String));
        expect(game).toHaveProperty("updatedAt", expect.any(String));
      });

      test("Should filter games by genre", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?filter=MOBA"
        );

        expect(status).toBe(200);
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data.every((game) => game.genre === "MOBA")).toBe(true);
      });

      test("Should search games by title (case-insensitive)", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?search=league"
        );

        expect(status).toBe(200);
        expect(body.data.length).toBe(1);
        expect(body.data[0].title).toBe("League of Legends");
        expect(body.totalData).toBe(1);
      });

      test("Should handle URL encoded search terms", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?search=test%20game%2010"
        );

        expect(status).toBe(200);
        expect(body.data.length).toBe(1);
        expect(body.data[0].title).toBe("Test Game 10");
      });

      test("Should handle custom pagination - page size", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?page[size]=5"
        );

        expect(status).toBe(200);
        expect(body.dataPerPage).toBe(5);
        expect(body.data.length).toBe(5);
        expect(body.totalPage).toBe(11); // Math.ceil(55/5)
      });

      test("Should handle custom pagination - page number", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?page[size]=5&page[number]=2"
        );

        expect(status).toBe(200);
        expect(body.page).toBe(2);
        expect(body.dataPerPage).toBe(5);
        expect(body.data.length).toBe(5);

        // Verify we're getting different data than page 1
        const page1 = await request(app).get(
          "/pub-games?page[size]=5&page[number]=1"
        );
        expect(body.data[0].id).not.toBe(page1.body.data[0].id);
      });

      test("Should sort by createdAt ascending (oldest first)", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?sort=createdAt"
        );

        expect(status).toBe(200);

        // Verify sorting
        for (let i = 1; i < body.data.length; i++) {
          const prevDate = new Date(body.data[i - 1].createdAt);
          const currDate = new Date(body.data[i].createdAt);
          expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
        }
      });

      test("Should sort by createdAt descending (newest first)", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?sort=-createdAt"
        );

        expect(status).toBe(200);

        // Verify sorting
        for (let i = 1; i < body.data.length; i++) {
          const prevDate = new Date(body.data[i - 1].createdAt);
          const currDate = new Date(body.data[i].createdAt);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      });

      test("Should return empty array when no games match search", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?search=nonexistentgamexyz123"
        );

        expect(status).toBe(200);
        expect(body.data).toEqual([]);
        expect(body.totalData).toBe(0);
        expect(body.totalPage).toBe(0);
        expect(body.page).toBe(1);
      });

      test("Should handle pagination beyond available pages", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?page[number]=999"
        );

        expect(status).toBe(200);
        expect(body.data).toEqual([]);
        expect(body.page).toBe(999);
        expect(body.totalData).toBe(55);
      });
    });

    describe("Edge Cases and Current Implementation Behavior", () => {
      test("BUG: Search query overrides filter query (implementation bug)", async () => {
        // This test documents the current bug where search overwrites filter
        const { status, body } = await request(app).get(
          "/pub-games?filter=MOBA&search=apex"
        );

        expect(status).toBe(200);
        // Due to the bug, only search is applied, filter is ignored
        expect(body.data.length).toBe(1);
        expect(body.data[0].title).toBe("Apex Legends");
        expect(body.data[0].genre).toBe("Shooter"); // Not MOBA!
      });

      test("Should handle special characters in search safely", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?search=%25%27%22"
        );

        expect(status).toBe(200);
        expect(body).toHaveProperty("data");
        expect(body.data).toEqual([]); // No SQL injection, just empty results
      });

      test("Should handle SQL injection attempts in search", async () => {
        const maliciousSearch = "'; DROP TABLE GameLists; --";
        const { status, body } = await request(app).get(
          `/pub-games?search=${encodeURIComponent(maliciousSearch)}`
        );

        expect(status).toBe(200);
        expect(body).toHaveProperty("data");

        // Verify table still exists
        const count = await GameList.count();
        expect(count).toBe(55);
      });

      test("Should handle invalid page size gracefully", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?page[size]=invalid"
        );

        expect(status).toBe(200);
        // Falls back to default
        expect(body.dataPerPage).toBe(10);
      });

      test("Should handle negative page numbers", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?page[number]=-1"
        );

        expect(status).toBe(200);
        expect(body.page).toBe(1);
        // Sequelize will handle offset calculation, might return unexpected results
      });

      test("Should handle extremely large page size", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?page[size]=1000"
        );

        expect(status).toBe(200);
        expect(body.dataPerPage).toBe(1000);
        expect(body.data.length).toBe(55); // All games
        expect(body.totalPage).toBe(1);
      });
    });

    describe("Combined Query Parameters", () => {
      test("Should handle pagination with sorting", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?sort=-createdAt&page[size]=3&page[number]=2"
        );

        expect(status).toBe(200);
        expect(body.page).toBe(2);
        expect(body.dataPerPage).toBe(3);
        expect(body.data.length).toBe(3);

        // Verify still sorted correctly
        for (let i = 1; i < body.data.length; i++) {
          const prevDate = new Date(body.data[i - 1].createdAt);
          const currDate = new Date(body.data[i].createdAt);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      });

      test("Should handle filter with sorting", async () => {
        const { status, body } = await request(app).get(
          "/pub-games?filter=Shooter&sort=createdAt"
        );

        expect(status).toBe(200);
        expect(body.data.every((game) => game.genre === "Shooter")).toBe(true);

        // Verify sorting within filtered results
        for (let i = 1; i < body.data.length; i++) {
          const prevDate = new Date(body.data[i - 1].createdAt);
          const currDate = new Date(body.data[i].createdAt);
          expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
        }
      });
    });
  });

  describe("GET /pub-games/:id - Get Game By ID", () => {
    describe("Success Cases", () => {
      test("Should return a game by valid ID", async () => {
        const { status, body } = await request(app).get("/pub-games/1");

        expect(status).toBe(200);
        expect(body).toHaveProperty("id", 1);
        expect(body).toHaveProperty("title", "Counter-Strike 2");
        expect(body).toHaveProperty("genre", "Shooter");
        expect(body).toHaveProperty("platform", "PC (Windows)");
      });

      test("Should return different games for different IDs", async () => {
        const game1 = await request(app).get("/pub-games/1");
        const game2 = await request(app).get("/pub-games/2");

        expect(game1.body.id).not.toBe(game2.body.id);
        expect(game1.body.title).not.toBe(game2.body.title);
      });
    });

    describe("Error Cases", () => {
      test("Should return 404 for non-existent game ID", async () => {
        const { status, body } = await request(app).get("/pub-games/99999");

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Game not found");
      });
    });
  });

  describe("Controller Implementation Notes", () => {
    test("Performance: Response time should be reasonable", async () => {
      const start = Date.now();
      await request(app).get("/pub-games?page[size]=50");
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});

afterAll(async () => {
  await queryInterface.bulkDelete("GameLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});
