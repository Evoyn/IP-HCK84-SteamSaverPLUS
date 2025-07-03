// src/store/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://goat.nebux.site/";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async thunk to fetch user's wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/wishlist`,
        getAuthHeaders()
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to add item to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (gameData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/wishlist/${gameData.id}`,
        { gameListId: gameData.id },
        getAuthHeaders()
      );
      // Return the game data to add to state
      return gameData;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to remove item from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (gameId, { rejectWithValue }) => {
    try {
      // console.log(gameId, "<<<< gameId in thunk");

      await axios.delete(
        `${API_BASE_URL}/wishlist/${gameId}`,
        getAuthHeaders()
      );

      return gameId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // Array of game objects in wishlist
    wishlistMap: {}, // Map of gameId to wishlistId for easy lookup
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistMap = {};
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist cases
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming API returns array of wishlist items with game data
        state.items = action.payload.map((item) => item.GameList || item.game);
        // Create a map for quick lookup
        state.wishlistMap = action.payload.reduce((acc, item) => {
          acc[item.GameListId || item.gameListId] = item.id;
          return acc;
        }, {});
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to wishlist cases
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const game = action.payload;
        // Add game to items if not already present
        if (!state.wishlistMap[game.id]) {
          state.items.push(game);
          // For now, we'll use the game id as wishlist id (should be updated from API response)
          state.wishlistMap[game.id] = game.id;
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from wishlist cases
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const gameId = action.payload;
        // Remove from items array
        state.items = state.items.filter((item) => item.id !== gameId);
        // Remove from map
        delete state.wishlistMap[gameId];
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearWishlist, clearError } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsInWishlist = (gameId) => (state) =>
  !!state.wishlist.wishlistMap[gameId];
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;

export default wishlistSlice.reducer;
