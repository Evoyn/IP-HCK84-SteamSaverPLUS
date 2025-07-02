"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./TopDiscounts.module.css";
import WishlistIcon from "./WishlistIcon";
import { Link } from "react-router";

const Recommendations = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!authToken) {
        setError("You need to log in to get AI recommendation");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create axios instance with timeout
        const axiosInstance = axios.create({
          timeout: 30000, // 30 seconds timeout
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Fetching recommendations...");
        const startTime = Date.now();

        const response = await axiosInstance.get(
          "http://localhost:3000/recommendations"
        );

        console.log(`Response received in ${Date.now() - startTime}ms`);

        const recommended = response.data?.data?.recommendations || [];
        const limited = recommended.slice(0, 10);

        const transformedGames = limited.map((game) => ({
          id: game.id || Math.random().toString(36),
          title: game.title,
          category: game.genre || "RECOMMENDED",
          image: game.thumbnail,
          discount: 0,
          originalPrice: 0,
          currentPrice: 0,
          game_url: game.game_url,
        }));

        setGames(transformedGames);
        setError(null);
      } catch (err) {
        console.error("Error fetching recommendations:", err);

        // Handle different error types
        if (err.code === "ECONNABORTED") {
          setError(
            "Request timed out. The AI is taking longer than expected. Please try again."
          );
        } else if (err.response?.status === 429) {
          setError("Too many requests. Please wait a moment and try again.");
        } else if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
          localStorage.removeItem("authToken");
        } else if (!err.response) {
          setError("Network error. Please check your connection.");
        } else {
          setError("Failed to load recommendations. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [authToken, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = 250;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 3;
    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  const handleImageLoad = (gameId) => {
    setLoadedImages((prev) => new Set([...prev, gameId]));
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();
    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
    };
  }, [games]);

  if (isLoading) {
    return (
      <TopDiscountsSkeleton title="Recommended for You" isLoading={true} />
    );
  }

  if (error) {
    return (
      <section className={styles.topDiscounts}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recommended for You</h2>
        </div>
        <div
          style={{
            color: "white",
            textAlign: "center",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <p>{error}</p>
          {!authToken ? (
            <Link
              to="/login"
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-block",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleRetry}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            >
              Try Again
            </button>
          )}
        </div>
      </section>
    );
  }

  if (games.length === 0) {
    return (
      <section className={styles.topDiscounts}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recommended for You</h2>
        </div>
        <p style={{ color: "white", textAlign: "center" }}>
          No recommendations found
        </p>
      </section>
    );
  }

  return (
    <section className={styles.topDiscounts}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recommended for You</h2>
      </div>
      <div className={styles.cardsWrapper}>
        <button
          className={`${styles.navButton} ${styles.navLeft} ${
            !canScrollLeft ? styles.disabled : ""
          }`}
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft />
        </button>
        <button
          className={`${styles.navButton} ${styles.navRight} ${
            !canScrollRight ? styles.disabled : ""
          }`}
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight />
        </button>
        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onImageLoad={handleImageLoad}
              isImageLoaded={loadedImages.has(game.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const GameCard = ({ game, index, onImageLoad, isImageLoaded }) => {
  const handleCardClick = () => {
    if (game.game_url) {
      window.open(game.game_url, "_blank");
    }
  };

  return (
    <article
      className={styles.gameCard}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleCardClick}
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && handleCardClick()}
      role="button"
      aria-label={`Open ${game.title}`}
    >
      <div className={styles.imageContainer}>
        <img
          src={game.image || "/placeholder.svg?height=240&width=250"}
          alt={game.title}
          className={`${styles.gameImage} ${
            isImageLoaded ? styles.loaded : ""
          }`}
          onLoad={() => onImageLoad(game.id)}
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=240&width=250";
            onImageLoad(game.id);
          }}
          loading="lazy"
        />
        <div className={styles.vignetteOverlay} />
      </div>
      <div className={styles.contentArea}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <p className={styles.category}>{game.category}</p>
          <WishlistIcon game={game} />
        </div>
        <h3 className={styles.gameTitle}>{game.title}</h3>
        <div className={styles.priceSection}>
          <p className={styles.freePrice}>FREE</p>
        </div>
      </div>
    </article>
  );
};

const TopDiscountsSkeleton = ({ title, isLoading }) => {
  return (
    <section className={styles.topDiscounts}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.cardsWrapper}>
        <div className={styles.scrollContainer}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonCategory} />
                <div className={styles.skeletonGameTitle} />
                <div className={styles.skeletonPrice} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {isLoading && (
        <p
          style={{
            color: "white",
            textAlign: "center",
            marginTop: "10px",
            fontSize: "14px",
            opacity: 0.8,
          }}
        >
          AI is generating personalized recommendations...
        </p>
      )}
    </section>
  );
};

export default Recommendations;
