// src/pages/Wishlist.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Heart, Trash2, ExternalLink, Loader } from "lucide-react";
import {
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError,
  fetchWishlist,
  removeFromWishlist,
  clearError,
} from "../store/slices/wishlistSlice";
import styles from "./Wishlist.module.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const error = useSelector(selectWishlistError);
  const [removingId, setRemovingId] = useState(null);

  const authToken =
    localStorage.getItem("authToken") || localStorage.getItem("access_token");

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
      return;
    }

    // Fetch wishlist on mount
    try {
      const tokenPayload = JSON.parse(atob(authToken.split(".")[1]));
      const userId = tokenPayload.id || tokenPayload.userId;
      if (userId) {
        dispatch(fetchWishlist(userId));
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }

    return () => {
      dispatch(clearError());
    };
  }, [authToken, dispatch, navigate]);

  const handleRemoveFromWishlist = async (item) => {
    setRemovingId(item.id);
    try {
      await dispatch(removeFromWishlist(item.id)).unwrap();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleGameClick = (gameUrl) => {
    if (gameUrl) {
      window.open(gameUrl, "_blank");
    }
  };

  if (loading && wishlistItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader className={styles.spinner} size={48} />
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Heart className={styles.titleIcon} fill="#00CED1" />
            My Wishlist
          </h1>
          <p className={styles.subtitle}>
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "game" : "games"} saved
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <p>{error}</p>
          <button
            onClick={() => dispatch(clearError())}
            className={styles.dismissButton}
          >
            ×
          </button>
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className={styles.emptyState}>
          <Heart size={64} className={styles.emptyIcon} />
          <h2>Your wishlist is empty</h2>
          <p>Start adding games you're interested in!</p>
          <button
            onClick={() => navigate("/")}
            className={styles.primaryButton}
          >
            Discover Games
          </button>
        </div>
      ) : (
        <div className={styles.wishlistGrid}>
          {wishlistItems.map((item) => (
            <article key={item.id} className={styles.wishlistCard}>
              <div className={styles.imageContainer}>
                <img
                  src={item.image || item.thumbnail || "/placeholder.svg"}
                  alt={item.title}
                  className={styles.gameImage}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=240&width=250";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <button
                    onClick={() => handleGameClick(item.game_url)}
                    className={styles.playButton}
                    title="Open game page"
                  >
                    <ExternalLink size={20} />
                    <span>View Game</span>
                  </button>
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.gameInfo}>
                  <h3 className={styles.gameTitle}>{item.title}</h3>
                  <p className={styles.gameCategory}>
                    {item.category || item.genre || "Game"}
                  </p>
                </div>

                <div className={styles.cardActions}>
                  <div className={styles.priceTag}>
                    {item.currentPrice === 0 || !item.currentPrice ? (
                      <span className={styles.freeTag}>FREE</span>
                    ) : (
                      <span className={styles.price}>${item.currentPrice}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveFromWishlist(item)}
                    disabled={removingId === item.id}
                    className={styles.removeButton}
                    title="Remove from wishlist"
                  >
                    {removingId === item.id ? (
                      <Loader className={styles.spinner} size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
