const app = require("../app");
const request = require("supertest");
const { sequelize, User, GameList, Genre } = require("../models");
const { queryInterface } = sequelize;
const { signToken } = require("../helpers/jwt");

let tokenAdmin;
let tokenUser;
let tokenSalah = "inisalah";
let adminUser;
let regularUser;

const gameData = [
  {
    id: 1,
    title: "Test Game 1",
    thumbnail: "https://example.com/game1.jpg",
    short_description: "A test game",
    game_url: "https://example.com/game1",
    genre: "Action",
    platform: "PC",
    publisher: "Test Publisher",
    developer: "Test Developer",
    release_date: "2023-01-01",
    freetogame_profile_url: "https://example.com/profile1",
  },
  {
    id: 2,
    title: "Test Game 2",
    thumbnail: "https://example.com/game2.jpg",
    short_description: "Another test game",
    game_url: "https://example.com/game2",
    genre: "RPG",
    platform: "PC",
    publisher: "Test Publisher 2",
    developer: "Test Developer 2",
    release_date: "2023-02-01",
    freetogame_profile_url: "https://example.com/profile2",
  },
];

beforeAll(async () => {
  // Clean tables
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

  // Create genres
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

  // Create users
  adminUser = await User.create({
    username: "admin",
    email: "admin@example.com",
    password: "password123",
  });

  regularUser = await User.create({
    username: "user",
    email: "user@example.com",
    password: "password123",
  });

  // Generate tokens
  tokenAdmin = signToken({ id: adminUser.id });
  tokenUser = signToken({ id: regularUser.id });

  // Insert test games
  await queryInterface.bulkInsert(
    "GameLists",
    gameData.map((game) => {
      game.createdAt = new Date();
      game.updatedAt = new Date();
      return game;
    })
  );
});

describe("/games", () => {
  //! GET ALL
  describe("GET /games", () => {
    describe("Success", () => {
      test("Berhasil mendapatkan semua games (200)", async () => {
        const { status, body } = await request(app)
          .get("/games")
          .set("Authorization", `Bearer ${tokenAdmin}`);

        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body).toHaveLength(2);
        expect(body[0]).toHaveProperty("id", expect.any(Number));
        expect(body[0]).toHaveProperty("title", expect.any(String));
        expect(body[0]).toHaveProperty("genre", expect.any(String));
      });
    });

    describe("Failed", () => {
      //! belum login
      test("Gagal mendapatkan games karena belum login (401)", async () => {
        const { status, body } = await request(app).get("/games");

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });

      //! token salah
      test("Gagal mendapatkan games karena token tidak valid (401)", async () => {
        const { status, body } = await request(app)
          .get("/games")
          .set("Authorization", `Bearer ${tokenSalah}`);

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });
    });
  });

  //! GET BY ID
  describe("GET /games/:id", () => {
    describe("Success", () => {
      test("Berhasil mendapatkan game berdasarkan id (200)", async () => {
        const { status, body } = await request(app)
          .get("/games/1")
          .set("Authorization", `Bearer ${tokenAdmin}`);

        expect(status).toBe(200);
        expect(body).toHaveProperty("id", 1);
        expect(body).toHaveProperty("title", "Test Game 1");
        expect(body).toHaveProperty("genre", "Action");
      });
    });

    describe("Failed", () => {
      //! game not found
      test("Gagal mendapatkan game dengan id yang tidak ada (404)", async () => {
        const { status, body } = await request(app)
          .get("/games/999")
          .set("Authorization", `Bearer ${tokenAdmin}`);

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Game not found");
      });

      //! belum login
      test("Gagal mendapatkan game karena belum login (401)", async () => {
        const { status, body } = await request(app).get("/games/1");

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });
    });
  });

  //! CREATE
  describe("POST /games", () => {
    describe("Success", () => {
      test("Berhasil membuat game baru (201)", async () => {
        const newGame = {
          id: 3,
          title: "New Test Game",
          thumbnail: "https://example.com/new-game.jpg",
          short_description: "A brand new test game",
          game_url: "https://example.com/new-game",
          genre: "Strategy",
          platform: "PC",
          publisher: "New Publisher",
          developer: "New Developer",
          release_date: "2023-03-01",
          freetogame_profile_url: "https://example.com/new-profile",
        };

        const { status, body } = await request(app)
          .post("/games")
          .set("Authorization", `Bearer ${tokenAdmin}`)
          .send(newGame);

        expect(status).toBe(201);
        expect(body).toHaveProperty("id", expect.any(Number));
        expect(body).toHaveProperty("title", newGame.title);
        expect(body).toHaveProperty("genre", newGame.genre);
      });
    });

    describe("Failed", () => {
      //! title tidak diisi
      test("Gagal membuat game ketika title tidak diisi (400)", async () => {
        const { status, body } = await request(app)
          .post("/games")
          .set("Authorization", `Bearer ${tokenAdmin}`)
          .send({
            genre: "Action",
            platform: "PC",
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Please enter your title");
      });

      //! belum login
      test("Gagal membuat game karena belum login (401)", async () => {
        const { status, body } = await request(app).post("/games").send({
          title: "Test Game",
          genre: "Action",
        });

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });
    });
  });

  //! UPDATE
  describe("PUT /games/:id", () => {
    describe("Success", () => {
      test("Berhasil mengupdate game (200)", async () => {
        const updateData = {
          title: "Updated Game Title",
          genre: "Updated Genre",
        };

        const { status, body } = await request(app)
          .put("/games/1")
          .set("Authorization", `Bearer ${tokenAdmin}`)
          .send(updateData);

        expect(status).toBe(200);
        expect(body).toHaveProperty("id", 1);
        expect(body).toHaveProperty("title", updateData.title);
        expect(body).toHaveProperty("genre", updateData.genre);
      });
    });

    describe("Failed", () => {
      //! game not found
      test("Gagal update game dengan id yang tidak ada (404)", async () => {
        const { status, body } = await request(app)
          .put("/games/999")
          .set("Authorization", `Bearer ${tokenAdmin}`)
          .send({ title: "Updated" });

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Game not found");
      });

      //! belum login
      test("Gagal update game karena belum login (401)", async () => {
        const { status, body } = await request(app)
          .put("/games/1")
          .send({ title: "Updated" });

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });

      //! token salah
      test("Gagal update game karena token tidak valid (401)", async () => {
        const { status, body } = await request(app)
          .put("/games/1")
          .set("Authorization", `Bearer ${tokenSalah}`)
          .send({ title: "Updated" });

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });
    });
  });

  //! DELETE
  describe("DELETE /games/:id", () => {
    describe("Success", () => {
      test("Berhasil menghapus game (204)", async () => {
        const { status } = await request(app)
          .delete("/games/2")
          .set("Authorization", `Bearer ${tokenAdmin}`);

        expect(status).toBe(204);
      });
    });

    describe("Failed", () => {
      //! game not found
      test("Gagal hapus game dengan id yang tidak ada (404)", async () => {
        const { status, body } = await request(app)
          .delete("/games/999")
          .set("Authorization", `Bearer ${tokenAdmin}`);

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Game not found");
      });

      //! belum login
      test("Gagal hapus game karena belum login (401)", async () => {
        const { status, body } = await request(app).delete("/games/1");

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });
    });
  });

  //! GET GENRES
  describe("GET /genres", () => {
    describe("Success", () => {
      test("Berhasil mendapatkan semua genres (200)", async () => {
        const { status, body } = await request(app)
          .get("/games/genre")
          .set("Authorization", `Bearer ${tokenAdmin}`);

        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        expect(body[0]).toHaveProperty("id", expect.any(Number));
        expect(body[0]).toHaveProperty("name", expect.any(String));
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
});
