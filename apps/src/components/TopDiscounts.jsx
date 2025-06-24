"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./TopDiscounts.module.css";

const TopDiscounts = ({ excludedDealIds = [] }) => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Convert excludedDealIds to a string for stable comparison
  const excludedIdsString = excludedDealIds.join(",");

  // Fetch deals from CheapShark API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch more deals to ensure we have enough after filtering
        const response = await axios.get(
          "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=25&onSale=1"
        );

        // Transform and filter the data
        const transformedGames = response.data
          .filter((game) => {
            // Exclude games already in carousel
            if (
              excludedDealIds &&
              excludedDealIds.length > 0 &&
              excludedDealIds.includes(game.dealID)
            ) {
              return false;
            }
            // Only include games with some discount
            const savings = parseFloat(game.savings);
            return savings > 0;
          })
          .slice(0, 15) // Get up to 15 games
          .map((game) => {
            const savings = Math.round(parseFloat(game.savings));

            // Determine category based on metacritic score or rating
            let category = "ACTION";
            if (game.metacriticScore) {
              const score = parseInt(game.metacriticScore);
              if (score >= 85) category = "CRITICALLY ACCLAIMED";
              else if (score >= 75) category = "HIGHLY RATED";
              else if (score >= 60) category = "RECOMMENDED";
            } else if (game.steamRatingText) {
              if (game.steamRatingText.includes("Overwhelmingly"))
                category = "OVERWHELMINGLY POSITIVE";
              else if (game.steamRatingText.includes("Very"))
                category = "VERY POSITIVE";
              else if (game.steamRatingText.includes("Mostly"))
                category = "MOSTLY POSITIVE";
            }

            return {
              id: game.dealID,
              title: game.title,
              category: category,
              image: game.thumb,
              discount: savings,
              originalPrice: parseFloat(game.normalPrice),
              currentPrice: parseFloat(game.salePrice),
              dealID: game.dealID,
              steamAppID: game.steamAppID,
              metacriticScore: game.metacriticScore,
              steamRatingText: game.steamRatingText,
              steamRatingPercent: game.steamRatingPercent,
            };
          });

        setGames(transformedGames);
      } catch (err) {
        console.error("Error fetching deals:", err);
        setError(err.message || "Failed to load deals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [excludedIdsString]); // Use string comparison for stability

  // Check scroll position
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Handle scroll
  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 250; // Width of each card
    const gap = 16; // Gap between cards
    const scrollAmount = (cardWidth + gap) * 3; // Scroll 3 cards at a time

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  // Handle image load
  const handleImageLoad = (gameId) => {
    setLoadedImages((prev) => new Set([...prev, gameId]));
  };

  // Handle game click
  const handleGameClick = (game) => {
    if (game.dealID) {
      window.open(
        `https://www.cheapshark.com/redirect?dealID=${game.dealID}`,
        "_blank"
      );
    }
  };

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition(); // Initial check

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
    };
  }, [games]);

  if (isLoading) {
    return <TopDiscountsSkeleton />;
  }

  // Show error message for debugging
  if (error) {
    return (
      <section className={styles.topDiscounts}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Top Discounts
            <ChevronRight className={styles.titleChevron} />
          </h2>
        </div>
        <p style={{ color: "white", textAlign: "center" }}>Error: {error}</p>
      </section>
    );
  }

  // Show message if no games
  if (games.length === 0) {
    return (
      <section className={styles.topDiscounts}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Top Discounts
            <ChevronRight className={styles.titleChevron} />
          </h2>
        </div>
        <p style={{ color: "white", textAlign: "center" }}>
          No deals available at the moment
        </p>
      </section>
    );
  }

  return (
    <section className={styles.topDiscounts}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Top Discounts
          <ChevronRight className={styles.titleChevron} />
        </h2>
      </div>

      <div className={styles.cardsWrapper}>
        {/* Navigation Buttons */}
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

        {/* Games Container */}
        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onImageLoad={handleImageLoad}
              isImageLoaded={loadedImages.has(game.id)}
              onClick={() => handleGameClick(game)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Game Card Component
const GameCard = ({ game, index, onImageLoad, isImageLoaded, onClick }) => {
  return (
    <article
      className={styles.gameCard}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && onClick()}
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
        <p className={styles.category}>{game.category}</p>
        <h3 className={styles.gameTitle}>{game.title}</h3>

        <div className={styles.priceSection}>
          {game.currentPrice === 0 ? (
            <p className={styles.freePrice}>FREE</p>
          ) : game.discount > 0 ? (
            <div className={styles.discountedPrice}>
              <span className={styles.originalPrice}>
                ${game.originalPrice.toFixed(2)}
              </span>
              <span className={styles.currentPrice}>
                ${game.currentPrice.toFixed(2)}
              </span>
            </div>
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

// Loading Skeleton Component
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
