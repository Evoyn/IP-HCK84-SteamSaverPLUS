const { generateContent } = require("../helpers/gemini");
const { User, Genre, GameList } = require("../models");
const { Op } = require("sequelize");
// const sequelize = require("../config/database"); // Add this import for random ordering

const gameRecommendationController = {
  // Get game recommendations based on user's favorite genres
  getRecommendations: async (req, res) => {
    try {
      // Extract user ID from request (assuming you have auth middleware)
      const userId = req.user?.id || req.params.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Fetch user's favorite genres from database
      const userFavoriteGenres = await getUserFavoriteGenres(userId);

      if (!userFavoriteGenres || userFavoriteGenres.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No favorite genres found for user",
        });
      }

      // Create a detailed prompt for Gemini
      const prompt = createGameRecommendationPrompt(userFavoriteGenres);

      // Generate recommendations using Gemini
      const recommendations = await generateContent(prompt);

      // Parse and format the response
      const formattedRecommendations = parseGeminiResponse(recommendations);

      // Enrich recommendations with database info
      const enrichedRecommendations = await enrichRecommendationsWithGameList(
        formattedRecommendations,
        userFavoriteGenres
      );

      return res.status(200).json({
        success: true,
        data: {
          userId,
          favoriteGenres: userFavoriteGenres,
          recommendations: enrichedRecommendations,
        },
      });
    } catch (error) {
      console.error("Game recommendation error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate game recommendations",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};

// Helper function to create a comprehensive prompt for game recommendations
function createGameRecommendationPrompt(favoriteGenres) {
  const genresString = favoriteGenres.join(", ");

  return `You are a knowledgeable game recommendation expert. Based on the user's favorite genres: ${genresString}, Recommend 10 **unique** free PC games based on these genres: Shooter, MMORPG, and Action.

Avoid repeating the same games. Choose a **diverse** list from various developers and game types.

For each game, provide:
1. Game Title
2. Release Year
3. Developer/Publisher
4. Platforms Available
5. Primary Genres
6. Brief Description (2-3 sentences)
7. Why it matches their preferences
8. Rating (out of 10)

Format your response as a JSON array with the following structure:
[
  {
    "title": "Game Name",
    "releaseYear": 2023,
    "developer": "Developer Name",
    "platforms": ["PC", "PS5", "Xbox"],
    "genres": ["RPG", "Action"],
    "description": "Brief game description",
    "matchReason": "Why this game matches their preferences",
    "rating": 8.5
  }
]

Ensure the recommendations are diverse and include both popular and hidden gem titles.`;
}

// Helper function to parse Gemini's response
function parseGeminiResponse(geminiResponse) {
  try {
    // Attempt to extract JSON from the response
    // Gemini might include additional text, so we need to find the JSON array
    const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return parsedData;
    }

    // If no JSON found, return the raw response with a warning
    console.warn("Could not parse Gemini response as JSON");
    return {
      raw: geminiResponse,
      parsed: false,
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      raw: geminiResponse,
      parsed: false,
      error: error.message,
    };
  }
}

// Get user's favorite genres from database using Sequelize
async function getUserFavoriteGenres(userId) {
  try {
    // Find user with their associated genres
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Genre,
          through: {
            attributes: [], // Exclude join table attributes
          },
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Extract genre names from the associated genres
    const genreNames = user.Genres?.map((genre) => genre.name) || [];

    return genreNames;
  } catch (error) {
    console.error("Error fetching user genres:", error);
    throw error;
  }
}

// Enrich AI recommendations with actual GameList data
async function enrichRecommendationsWithGameList(recommendations, userGenres) {
  if (!Array.isArray(recommendations)) {
    // If parsing failed, try to get games from database directly
    return await getGamesFromDatabase(userGenres);
  }

  try {
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        // Try to find exact match first
        let gameFromDb = await GameList.findOne({
          where: {
            title: {
              [Op.like]: `%${rec.title}%`,
            },
          },
        });

        // If no exact match, try to find by genre
        if (!gameFromDb && rec.genres && rec.genres.length > 0) {
          gameFromDb = await GameList.findOne({
            where: {
              genre: {
                [Op.or]: rec.genres.map((g) => ({
                  [Op.like]: `%${g}%`,
                })),
              },
            },
          });
        }

        // If we found a game in database, use its data
        if (gameFromDb) {
          return {
            id: gameFromDb.id,
            title: gameFromDb.title,
            thumbnail: gameFromDb.thumbnail,
            short_description: gameFromDb.short_description || rec.description,
            game_url: gameFromDb.game_url,
            genre: gameFromDb.genre,
            platform: gameFromDb.platform,
            publisher: gameFromDb.publisher,
            developer: gameFromDb.developer,
            release_date: gameFromDb.release_date,
            freetogame_profile_url: gameFromDb.freetogame_profile_url,
            rating: rec.rating || null,
            matchReason:
              rec.matchReason || `Matches your interest in ${gameFromDb.genre}`,
            fromDatabase: true,
          };
        }

        // If not in database, return AI recommendation as is
        return {
          ...rec,
          fromDatabase: false,
        };
      })
    );

    // If we have less than 5 games, try to fill with more from database
    if (enrichedRecommendations.filter((r) => r.fromDatabase).length < 5) {
      const additionalGames = await getGamesFromDatabase(
        userGenres,
        5 - enrichedRecommendations.filter((r) => r.fromDatabase).length,
        enrichedRecommendations.filter((r) => r.fromDatabase).map((r) => r.id)
      );

      return [
        ...enrichedRecommendations.filter((r) => r.fromDatabase),
        ...additionalGames,
      ];
    }

    return enrichedRecommendations;
  } catch (error) {
    console.error("Error enriching recommendations:", error);
    // Fallback to database games if enrichment fails
    return await getGamesFromDatabase(userGenres);
  }
}

// Get games directly from database based on genres
async function getGamesFromDatabase(genres, limit = 5, excludeIds = []) {
  try {
    const whereClause = {
      [Op.or]: genres.map((genre) => ({
        genre: {
          [Op.like]: `%${genre}%`,
        },
      })),
    };

    // Exclude already recommended games
    if (excludeIds.length > 0) {
      whereClause.id = {
        [Op.notIn]: excludeIds,
      };
    }

    const games = await GameList.findAll({
      where: whereClause,
      limit: limit,
      order: sequelize.random(), // Random order for variety
    });

    return games.map((game) => ({
      id: game.id,
      title: game.title,
      thumbnail: game.thumbnail,
      short_description: game.short_description,
      game_url: game.game_url,
      genre: game.genre,
      platform: game.platform,
      publisher: game.publisher,
      developer: game.developer,
      release_date: game.release_date,
      freetogame_profile_url: game.freetogame_profile_url,
      matchReason: `Matches your interest in ${game.genre}`,
      fromDatabase: true,
    }));
  } catch (error) {
    console.error("Error fetching games from database:", error);
    return [];
  }
}

module.exports = gameRecommendationController;
