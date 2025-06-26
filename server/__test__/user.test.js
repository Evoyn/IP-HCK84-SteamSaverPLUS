const app = require("../app");
const request = require("supertest");
const { sequelize, User, Genre } = require("../models");
const { queryInterface } = sequelize;
const { signToken } = require("../helpers/jwt");

// Mock Google OAuth
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({
        sub: "123456789",
        email: "googleuser@gmail.com",
        name: "Google User",
      }),
    }),
  })),
}));

beforeAll(async () => {
  // Clean tables
  await queryInterface.bulkDelete("UserGenres", null, {
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

  // Create test genres
  const genres = [
    { id: 1, name: "Action", description: "Action games" },
    { id: 2, name: "RPG", description: "Role-playing games" },
    { id: 3, name: "Strategy", description: "Strategy games" },
    { id: 4, name: "Adventure", description: "Adventure games" },
    { id: 5, name: "Simulation", description: "Simulation games" },
  ];

  await queryInterface.bulkInsert(
    "Genres",
    genres.map((genre) => ({
      ...genre,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  // Create test user
  const user = await User.create({
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  });

  await user.addGenres([1, 2]);
});

describe("/users", () => {
  //! REGISTER
  describe("POST /register", () => {
    describe("Success", () => {
      test("Berhasil register user baru dengan genres (201)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "newuser",
            email: "newuser@example.com",
            password: "password123",
            genres: [1, 2, 3],
          });

        expect(status).toBe(201);
        expect(body).toHaveProperty("message", "User registered successfully");
        expect(body).toHaveProperty("user");
        expect(body.user).toHaveProperty("id", expect.any(Number));
        expect(body.user).toHaveProperty("username", "newuser");
        expect(body.user).toHaveProperty("email", "newuser@example.com");
      });
    });

    describe("Failed", () => {
      //! genres bukan array
      test("Gagal register ketika genres bukan array (400)", async () => {
        const { status, body } = await request(app).post("/register").send({
          username: "failuser1",
          email: "fail1@example.com",
          password: "password123",
          genres: "not-an-array",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "Genres must be an array with at least 1 item."
        );
      });

      //! genres array kosong
      test("Gagal register ketika genres array kosong (400)", async () => {
        const { status, body } = await request(app).post("/register").send({
          username: "failuser2",
          email: "fail2@example.com",
          password: "password123",
          genres: [],
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "Genres must be an array with at least 1 item."
        );
      });

      //! genres lebih dari 3
      test("Gagal register ketika memilih lebih dari 3 genres (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "failuser3",
            email: "fail3@example.com",
            password: "password123",
            genres: [1, 2, 3, 4],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "You can only select up to 3 genres."
        );
      });

      //! genre ID tidak valid
      test("Gagal register dengan genre ID yang tidak valid (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "failuser4",
            email: "fail4@example.com",
            password: "password123",
            genres: [999, 1000],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Some genre IDs are invalid.");
      });

      //! email sudah terdaftar
      test("Gagal register dengan email yang sudah terdaftar (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "duplicateuser",
            email: "test@example.com", // Email sudah ada
            password: "password123",
            genres: [1, 2],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Email must be unique");
      });

      //! username sudah terdaftar
      test("Gagal register dengan username yang sudah terdaftar (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "testuser", // Username sudah ada
            email: "different@example.com",
            password: "password123",
            genres: [1, 2],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Username must be unique");
      });

      //! email tidak diisi
      test("Gagal register ketika email tidak diisi (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "noemail",
            password: "password123",
            genres: [1, 2],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Email is required");
      });

      //! username tidak diisi
      test("Gagal register ketika username tidak diisi (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            email: "nouser@example.com",
            password: "password123",
            genres: [1, 2],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Username is required");
      });

      //! password tidak diisi
      test("Gagal register ketika password tidak diisi (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "nopass",
            email: "nopass@example.com",
            genres: [1, 2],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Password is required");
      });

      //! format email tidak valid
      test("Gagal register dengan format email tidak valid (400)", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send({
            username: "invalidemail",
            email: "not-an-email",
            password: "password123",
            genres: [1, 2],
          });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Invalid email format");
      });
    });
  });

  //! LOGIN
  describe("POST /login", () => {
    describe("Success", () => {
      test("Berhasil login dan mengirimkan access_token (200)", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "test@example.com",
          password: "password123",
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty("access_token", expect.any(String));
      });
    });

    describe("Failed", () => {
      //! email tidak diinput
      test("Email tidak diberikan / tidak diinput (400)", async () => {
        const { status, body } = await request(app).post("/login").send({
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Email is required");
      });

      //! password tidak diinput
      test("Password tidak diberikan / tidak diinput (400)", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "test@example.com",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Password is required");
      });

      //! invalid email
      test("Email diberikan invalid / tidak terdaftar (401)", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "notfound@example.com",
          password: "password123",
        });

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid email/password");
      });

      //! invalid password
      test("Password diberikan salah / tidak match (401)", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "test@example.com",
          password: "wrongpassword",
        });

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid email/password");
      });

      //! email string kosong
      test("Email diberikan string kosong (400)", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "",
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Email is required");
      });

      //! password string kosong
      test("Password diberikan string kosong (400)", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "test@example.com",
          password: "",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Password is required");
      });
    });
  });

  //! GOOGLE LOGIN
  describe("POST /google-login", () => {
    describe("Success", () => {
      test("Berhasil login dengan Google untuk user baru (200)", async () => {
        const { status, body } = await request(app).post("/google-login").send({
          googleToken: "valid-google-token",
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty("Login", "Google login successful");
        expect(body).toHaveProperty("access_token", expect.any(String));
      });

      test("Berhasil login dengan Google untuk user yang sudah ada (200)", async () => {
        // Create user dengan email yang sama
        await User.create({
          username: "existinggoogle",
          email: "googleuser@gmail.com",
          password: "randompass",
        });

        const { status, body } = await request(app).post("/google-login").send({
          googleToken: "valid-google-token",
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty("Login", "Google login successful");
        expect(body).toHaveProperty("access_token", expect.any(String));
      });
    });

    describe("Failed", () => {
      test("Gagal login Google dengan token invalid (500)", async () => {
        // Mock untuk throw error
        const { OAuth2Client } = require("google-auth-library");
        const mockClient = new OAuth2Client();
        mockClient.verifyIdToken.mockRejectedValueOnce(
          new Error("Invalid token")
        );

        const { status, body } = await request(app).post("/google-login").send({
          googleToken: "invalid-token",
        });

        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
      });

      test("Gagal login Google tanpa token (500)", async () => {
        const { status, body } = await request(app)
          .post("/google-login")
          .send({});

        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
      });
    });
  });
});

afterAll(async () => {
  await queryInterface.bulkDelete("UserGenres", null, {
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
