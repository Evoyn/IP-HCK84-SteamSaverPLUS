"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./TopDiscounts.module.css";
import WishlistIcon from "./WishlistIcon";
import { Link, Links } from "react-router";

const TopDiscounts = ({ excludedDealIds = [] }) => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const excludedIdsString = excludedDealIds.join(",");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get("https://goat.nebux.site/pub-games");

        const shuffled = response.data.data
          .sort(() => Math.random() - 0.5) // Randomize
          .slice(0, 20); // Pick 20 only

        const transformedGames = shuffled.map((game) => ({
          id: game.id,
          title: game.title,
          category: game.category || "FREE GAME",
          image: game.thumbnail,
          discount: game.discount || 0,
          originalPrice: game.originalPrice,
          currentPrice: 0,
          game_url: game.game_url,
        }));

        setGames(transformedGames);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError(err.message || "Failed to load games");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [excludedIdsString]);

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
    return <TopDiscountsSkeleton />;
  }

  if (error) {
    return (
      <section className={styles.topDiscounts}>
        <div className={styles.header}>
          <h2 className={styles.title}>Free Games</h2>
        </div>
        <p style={{ color: "white", textAlign: "center" }}>Error: {error}</p>
      </section>
    );
  }

  if (games.length === 0) {
    return (
      <section className={styles.topDiscounts}>
        <div className={styles.header}>
          <h2 className={styles.title}>Free Games</h2>
        </div>
        <p style={{ color: "white", textAlign: "center" }}>
          No free games available at the moment
        </p>
      </section>
    );
  }

  return (
    <section className={styles.topDiscounts}>
      <div className={styles.header}>
        <h2 className={styles.title}>Free Games</h2>
      </div>
      <div className={styles.cardsWrapper}>
        <Link
          className={`${styles.navButton} ${styles.navLeft} ${
            !canScrollLeft ? styles.disabled : ""
          }`}
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft />
        </Link>
        <Link
          className={`${styles.navButton} ${styles.navRight} ${
            !canScrollRight ? styles.disabled : ""
          }`}
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight />
        </Link>
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
    window.open(game.game_url, "_blank");
  };

  return (
    <article
      className={styles.gameCard}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleCardClick}
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && handleCardClick()}
    >
      <div className={styles.imageContainer}>
        <img
          src={game.image}
          alt={game.title}
          className={`${styles.gameImage} ${
            isImageLoaded ? styles.loaded : ""
          }`}
          onLoad={() => onImageLoad(game.id)}
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=240&width=250";
          }}
        />
        <div className={styles.vignetteOverlay} />
        {game.discount > 0 && (
          <div className={styles.discountBadge}>-{game.discount}%</div>
        )}
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
          {game.currentPrice === 0 ? (
            <p className={styles.freePrice}>FREE</p>
          ) : (
            <p className={styles.regularPrice}>
              ${game.currentPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

const TopDiscountsSkeleton = () => {
  return (
    <section className={styles.topDiscounts}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
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
    </section>
  );
};

export default TopDiscounts;
