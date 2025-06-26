"use client";

import { Heart, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  addToWishlist,
  removeFromWishlist,
  selectIsInWishlist,
} from "../store/slices/wishlistSlice";
import styles from "./WishlistIcon.module.css";

const WishlistIcon = ({ game, size = 20, style = {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isInWishlist = useSelector(selectIsInWishlist(game.id));
  const wishlistLoading = useSelector((state) => state.wishlist.loading);
  const wishlistMap = useSelector((state) => state.wishlist.wishlistMap);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  // Check if user is authenticated by checking if access_token exists
  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        handleCloseError();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleCloseError = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowError(false);
      setIsClosing(false);
      setErrorMessage("");
    }, 300);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("Please login to add to wishlist");
      navigate("/login");
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(game.id)).unwrap();
      } else {
        // Check if game is already in wishlist before adding
        if (wishlistMap[game.id]) {
          setErrorMessage("You already have this game in wishlist");
          setShowError(true);
          return;
        }
        await dispatch(addToWishlist(game)).unwrap();
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      if (error.message && error.message.includes("already")) {
        setErrorMessage("You already have this game in wishlist");
      } else {
        setErrorMessage(error.message || "Failed to update wishlist");
      }
      setShowError(true);
    }
  };

  return (
    <>
      <button
        onClick={handleWishlistClick}
        disabled={wishlistLoading}
        className={`${styles.wishlistButton} ${
          isInWishlist ? styles.active : ""
        }`}
        style={style}
        title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart
          size={size}
          className={`${styles.heartIcon} ${isInWishlist ? styles.filled : ""}`}
        />
      </button>

      {showError && (
        <div
          className={`${styles.errorNotification} ${
            isClosing ? styles.fadeOut : ""
          }`}
        >
          <span>{errorMessage}</span>
          <button
            className={styles.closeButton}
            onClick={handleCloseError}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
};

export default WishlistIcon;
