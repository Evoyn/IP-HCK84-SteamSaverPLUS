// __tests__/pubGameList.test.js
const app = require("../app");
const request = require("supertest");
const { sequelize, GameList } = require("../models");
const { queryInterface } = sequelize;

beforeAll(async () => {
  // Clean table
  await queryInterface.bulkDelete("GameLists", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  // Create test games for pagination and filtering
  const games = [];
  for (let i = 1; i <= 20; i++) {
    games.push({
      id: i,
      title: `Game ${i}`,
      thumbnail: `https://example.com/game${i}.jpg`,
      short_description: `Description for game ${i}`,
      game_url: `https://example.com/game${i}`,
      genre: i % 3 === 0 ? "Strategy" : i % 2 === 0 ? "Action" : "RPG",
      platform: "PC",
      publisher: `Publisher ${i}`,
      developer: `Developer ${i}`,
      release_date: `2023-${String((i % 12) + 1).padStart(2, "0")}-01`,
      freetogame_profile_url: `https://example.com/profile${i}`,
      isPublic: i !== 15 ? true : false, // Game 15 is not public
      createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000), // Different dates
      updatedAt: new Date(),
    });
  }

  await queryInterface.bulkInsert("GameLists", games);
});

describe("/pub/games", () => {
  //! GET ALL PUBLIC GAMES
  describe("GET /pub/games", () => {
    describe("Success", () => {
      test("Berhasil mendapatkan daftar games dengan pagination default (200)", async () => {
        const { status, body } = await request(app).get("/pub/games");

        expect(status).toBe(200);
        expect(body).toHaveProperty("page", 1);
        expect(body).toHaveProperty("data");
        expect(body).toHaveProperty("totalData", expect.any(Number));
        expect(body).toHaveProperty("totalPage", expect.any(Number));
        expect(body).toHaveProperty("dataPerPage", 10);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data).toHaveLength(10); // Default limit is 10
      });

      //! Filter by genre
      test("Berhasil filter games berdasarkan genre (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?filter=Action"
        );

        expect(status).toBe(200);
        expect(body.data.every((game) => game.genre === "Action")).toBe(true);
        expect(body.totalData).toBeLessThan(20); // Should be less than total
      });

      //! Sort ascending
      test("Berhasil sort games ascending (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?sort=createdAt"
        );

        expect(status).toBe(200);
        expect(body.data).toHaveLength(10);

        // Check if sorted ascending
        for (let i = 1; i < body.data.length; i++) {
          const prevDate = new Date(body.data[i - 1].createdAt);
          const currDate = new Date(body.data[i].createdAt);
          expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
        }
      });

      //! Sort descending
      test("Berhasil sort games descending (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?sort=-createdAt"
        );

        expect(status).toBe(200);
        expect(body.data).toHaveLength(10);

        // Check if sorted descending
        for (let i = 1; i < body.data.length; i++) {
          const prevDate = new Date(body.data[i - 1].createdAt);
          const currDate = new Date(body.data[i].createdAt);
          expect(currDate.getTime()).toBeLessThanOrEqual(prevDate.getTime());
        }
      });

      //! Search by title
      test("Berhasil search games berdasarkan title (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?search=Game 1"
        );

        expect(status).toBe(200);
        expect(body.data.some((game) => game.title.includes("Game 1"))).toBe(
          true
        );
        // Should find Game 1, Game 10-19
      });

      //! Custom page size
      test("Berhasil mengatur custom page size (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?page[size]=5"
        );

        expect(status).toBe(200);
        expect(body.dataPerPage).toBe(5);
        expect(body.data).toHaveLength(5);
        expect(body.totalPage).toBeGreaterThan(body.totalData / 5 - 1);
      });

      //! Custom page number
      test("Berhasil navigasi ke halaman tertentu (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?page[number]=2&page[size]=5"
        );

        expect(status).toBe(200);
        expect(body.page).toBe(2);
        expect(body.dataPerPage).toBe(5);
        expect(body.data).toHaveLength(5);
      });

      //! Kombinasi filter, sort, dan search
      test("Berhasil kombinasi filter, sort, dan pagination (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?filter=RPG&sort=-createdAt&page[size]=3"
        );

        expect(status).toBe(200);
        expect(body.dataPerPage).toBe(3);
        expect(body.data.every((game) => game.genre === "RPG")).toBe(true);
        expect(body.data).toHaveLength(3);
      });

      //! Empty result
      test("Berhasil mendapatkan hasil kosong ketika tidak ada match (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?search=NonExistentGame"
        );

        expect(status).toBe(200);
        expect(body.data).toHaveLength(0);
        expect(body.totalData).toBe(0);
        expect(body.totalPage).toBe(0);
      });

      //! Page beyond available
      test("Berhasil handle page number yang melebihi total page (200)", async () => {
        const { status, body } = await request(app).get(
          "/pub/games?page[number]=100"
        );

        expect(status).toBe(200);
        expect(body.page).toBe(100);
        expect(body.data).toHaveLength(0); // No data on page 100
      });
    });
  });

  //! GET PUBLIC GAME BY ID
  describe("GET /pub/games/:id", () => {
    describe("Success", () => {
      test("Berhasil mendapatkan public game berdasarkan id (200)", async () => {
        const { status, body } = await request(app).get("/pub/games/1");

        expect(status).toBe(200);
        expect(body).toHaveProperty("id", 1);
        expect(body).toHaveProperty("title", "Game 1");
        expect(body).toHaveProperty("genre", "RPG");
        expect(body).toHaveProperty("isPublic", true);
      });
    });

    describe("Failed", () => {
      //! Game not found
      test("Gagal mendapatkan game dengan id yang tidak ada (404)", async () => {
        const { status, body } = await request(app).get("/pub/games/999");

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Game not found");
      });

      //! Game not public
      test("Gagal mendapatkan game yang tidak public (404)", async () => {
        const { status, body } = await request(app).get("/pub/games/15"); // Game 15 is not public

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Game not found");
      });

      //! Invalid ID format
      test("Gagal mendapatkan game dengan format id tidak valid (404)", async () => {
        const { status, body } = await request(app).get("/pub/games/abc");

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Game not found");
      });
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
