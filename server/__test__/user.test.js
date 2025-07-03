// Load environment variables for tests
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Set test environment variables if not already set
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "test-client-id";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// 🔧 Create the mock function
const mockVerifyIdToken = jest.fn();

// 🔧 Mock the google-auth-library BEFORE importing the app
jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
  };
});

const app = require("../app");
const request = require("supertest");
const { sequelize, User, Genre } = require("../models");
const { queryInterface } = sequelize;
const { signToken } = require("../helpers/jwt");

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

  // Create test genres - make sure we have 18 genres as expected by the controller
  const genres = [];
  for (let i = 1; i <= 18; i++) {
    genres.push({
      id: i,
      name: `Genre ${i}`,
      description: `Description for genre ${i}`,
    });
  }

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

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
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
  describe("POST /login/google", () => {
    describe("Success", () => {
      beforeEach(async () => {
        // Clean up before each test
        await User.destroy({
          where: { email: "googleuser@gmail.com" },
        });

        // Setup successful mock response with all required fields
        mockVerifyIdToken.mockResolvedValue({
          getPayload: () => ({
            sub: "123456789",
            email: "googleuser@gmail.com",
            name: "Google User",
            // Add other fields that might be needed
            email_verified: true,
            picture: "https://example.com/photo.jpg",
          }),
        });
      });

      // Temporary debug test
      test("DEBUG: Check environment and mocks", async () => {
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
        console.log("mockVerifyIdToken type:", typeof mockVerifyIdToken);

        try {
          const token = signToken({ id: 1 });
          console.log("Token generated successfully:", !!token);
        } catch (error) {
          console.log("Error generating token:", error.message);
        }

        const response = await request(app).post("/login/google").send({
          googleToken: "valid-google-token",
        });

        console.log("Response:", {
          status: response.status,
          body: response.body,
          error: response.error?.text || response.error,
        });

        expect(true).toBe(true); // Just to make test pass
      });

      test("Berhasil login dengan Google untuk user baru (200)", async () => {
        const { status, body } = await request(app).post("/login/google").send({
          googleToken: "valid-google-token",
        });

        // Debug: log the actual response
        console.log("Response status:", status);
        console.log("Response body:", body);

        expect(status).toBe(200);
        expect(body).toHaveProperty("access_token", expect.any(String));

        // Verify the mock was called
        expect(mockVerifyIdToken).toHaveBeenCalled();
      });

      test("Berhasil login dengan Google untuk user yang sudah ada (200)", async () => {
        // Create user dengan email yang sama terlebih dahulu
        const existingUser = await User.findOne({
          where: { email: "googleuser@gmail.com" },
        });

        if (!existingUser) {
          await User.create({
            username: "existinggoogle",
            email: "googleuser@gmail.com",
            password: "randompass",
          });
        }

        const { status, body } = await request(app).post("/login/google").send({
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
        mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

        const { status, body } = await request(app).post("/login/google").send({
          googleToken: "invalid-token",
        });

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });

      test("Gagal login Google tanpa token (500)", async () => {
        // Mock untuk scenario tanpa token
        mockVerifyIdToken.mockRejectedValue(new Error("No token provided"));

        const { status, body } = await request(app)
          .post("/login/google")
          .send({});

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });

      test("Gagal login Google dengan payload tidak lengkap (500)", async () => {
        // Mock response tanpa email
        mockVerifyIdToken.mockResolvedValue({
          getPayload: () => ({
            sub: "123456789",
            // email missing
            name: "Google User",
          }),
        });

        const { status, body } = await request(app).post("/login/google").send({
          googleToken: "incomplete-payload-token",
        });

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
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
