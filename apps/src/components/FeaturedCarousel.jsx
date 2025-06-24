"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Play,
  Pause,
} from "lucide-react";
import styles from "./FeaturedCarousel.module.css";

const FeaturedCarousel = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const carouselRef = useRef(null);

  // Fetch games from CheapShark API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch deals with discount > 15%
        const response = await axios.get(
          "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=60&pageSize=10"
        );

        // Filter and transform the data
        const transformedGames = response.data
          .filter((game) => {
            const savings = parseFloat(game.savings);
            return savings >= 15; // Only games with 15% or more discount
          })
          .slice(0, 5) // Get top 5 deals
          .map((game, index) => {
            const savings = Math.round(parseFloat(game.savings));
            const steamAppID = game.steamAppID;

            // Generate gradient based on index
            const gradients = [
              "linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)",
              "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
              "linear-gradient(135deg, #ffecd2, #fcb69f, #ff8a80)",
              "linear-gradient(135deg, #a8edea, #fed6e3, #d299c2)",
              "linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef)",
            ];

            // Determine badge based on savings
            let badge = "DEAL";
            if (savings >= 75) badge = "MEGA DEAL";
            else if (savings >= 50) badge = "GREAT DEAL";
            else if (savings >= 25) badge = "GOOD DEAL";

            return {
              id: game.dealID || index,
              title: game.title,
              subtitle: `${savings}% OFF`,
              description: `Save $${(
                parseFloat(game.normalPrice) - parseFloat(game.salePrice)
              ).toFixed(2)} on this amazing game. ${
                game.steamRatingText
                  ? `Rated "${game.steamRatingText}" by Steam users.`
                  : "Get it now while the offer lasts!"
              }`,
              dateRange: "LIMITED TIME OFFER",
              price: `$${game.salePrice}`,
              originalPrice: `$${game.normalPrice}`,
              discount: `${savings}%`,
              image: game.thumb,
              logo: null, // CheapShark doesn't provide logos
              thumbnail: game.thumb,
              ctaText: "Get Deal",
              ctaSecondary: "View on Steam",
              badge: badge,
              gradient: gradients[index % gradients.length],
              dealID: game.dealID,
              steamAppID: steamAppID,
              metacriticScore: game.metacriticScore,
              steamRatingText: game.steamRatingText,
              steamRatingPercent: game.steamRatingPercent,
              steamRatingCount: game.steamRatingCount,
              releaseDate: game.releaseDate,
              lastChange: game.lastChange,
              dealRating: game.dealRating,
            };
          });

        if (transformedGames.length === 0) {
          // If no games match criteria, fetch any deals
          const anyDealsResponse = await axios.get(
            "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=5"
          );

          const anyGames = anyDealsResponse.data
            .slice(0, 5)
            .map((game, index) => {
              const savings = Math.round(parseFloat(game.savings));
              const gradients = [
                "linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)",
                "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                "linear-gradient(135deg, #ffecd2, #fcb69f, #ff8a80)",
                "linear-gradient(135deg, #a8edea, #fed6e3, #d299c2)",
                "linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef)",
              ];

              return {
                id: game.dealID || index,
                title: game.title,
                subtitle: savings > 0 ? `${savings}% OFF` : "SPECIAL PRICE",
                description: `${
                  savings > 0
                    ? `Save $${(
                        parseFloat(game.normalPrice) -
                        parseFloat(game.salePrice)
                      ).toFixed(2)} on this game.`
                    : "Special pricing available now!"
                } ${
                  game.steamRatingText
                    ? `Rated "${game.steamRatingText}" by Steam users.`
                    : ""
                }`,
                dateRange: "AVAILABLE NOW",
                price: `$${game.salePrice}`,
                originalPrice: savings > 0 ? `$${game.normalPrice}` : null,
                discount: savings > 0 ? `${savings}%` : null,
                image: game.thumb,
                logo: null,
                thumbnail: game.thumb,
                ctaText: "Get Deal",
                ctaSecondary: "View Details",
                badge: savings > 0 ? "ON SALE" : "FEATURED",
                gradient: gradients[index % gradients.length],
                dealID: game.dealID,
                steamAppID: game.steamAppID,
                metacriticScore: game.metacriticScore,
                steamRatingText: game.steamRatingText,
                steamRatingPercent: game.steamRatingPercent,
                steamRatingCount: game.steamRatingCount,
                releaseDate: game.releaseDate,
                lastChange: game.lastChange,
                dealRating: game.dealRating,
              };
            });

          setFeaturedGames(anyGames);
        } else {
          setFeaturedGames(transformedGames);
        }
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Failed to load game deals. Please try again later.");
        // Set fallback data
        setFeaturedGames([
          {
            id: 1,
            title: "Unable to Load Deals",
            subtitle: "ERROR",
            description:
              "We're having trouble loading the latest game deals. Please check your connection and try again.",
            dateRange: "TRY AGAIN LATER",
            price: null,
            originalPrice: null,
            discount: null,
            image: "/placeholder.svg?height=600&width=1050",
            logo: null,
            thumbnail: "/placeholder.svg?height=80&width=80",
            ctaText: "Retry",
            ctaSecondary: "Go Back",
            badge: "ERROR",
            gradient: "linear-gradient(135deg, #ff6b6b, #ff8787, #ff6b6b)",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setProgress(0);

    // Progress bar animation
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 2; // 100% in 5 seconds (2% every 100ms)
      });
    }, 100);

    // Slide transition
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredGames.length);
      setProgress(0);
    }, 5000);
  }, [featuredGames.length]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  // Initialize auto-play
  useEffect(() => {
    if (isAutoPlaying && featuredGames.length > 0) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => {
      stopAutoPlay();
    };
  }, [isAutoPlaying, startAutoPlay, stopAutoPlay, featuredGames.length]);

  // Handle slide change
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
    if (isAutoPlaying) {
      startAutoPlay();
    }
  };

  // Handle image loading
  const handleImageLoad = (gameId) => {
    setLoadedImages((prev) => new Set([...prev, gameId]));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (featuredGames.length === 0) return;

      if (e.key === "ArrowLeft") {
        goToSlide(
          currentSlide === 0 ? featuredGames.length - 1 : currentSlide - 1
        );
      } else if (e.key === "ArrowRight") {
        goToSlide((currentSlide + 1) % featuredGames.length);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isAutoPlaying, featuredGames.length]);

  // Handle CTA button clicks
  const handlePrimaryClick = (game) => {
    if (error) {
      window.location.reload();
    } else if (game.dealID) {
      window.open(
        `https://www.cheapshark.com/redirect?dealID=${game.dealID}`,
        "_blank"
      );
    }
  };

  const handleSecondaryClick = (game) => {
    if (game.steamAppID) {
      window.open(
        `https://store.steampowered.com/app/${game.steamAppID}`,
        "_blank"
      );
    }
  };

  if (isLoading) {
    return <CarouselSkeleton />;
  }

  if (featuredGames.length === 0) {
    return <div className={styles.carousel}>No games available</div>;
  }

  const currentGame = featuredGames[currentSlide];

  return (
    <div className={styles.carousel} ref={carouselRef}>
      <div className={styles.container}>
        {/* Main Carousel Area */}
        <div
          className={styles.mainArea}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className={styles.slideContainer}>
            {/* Background Image */}
            <div
              className={styles.backgroundImage}
              style={{
                backgroundImage: `url(https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${currentGame.steamAppID}/header.jpg)`,
                // background: currentGame.gradient,game.steamAppID
              }}
            >
              <div className={styles.gradientOverlay} />
            </div>

            {/* Content Overlay */}
            <div className={styles.contentOverlay}>
              {currentGame.badge && (
                <div className={styles.badge}>{currentGame.badge}</div>
              )}

              {currentGame.logo && (
                <img
                  src={currentGame.logo || "/placeholder.svg"}
                  alt={`${currentGame.title} logo`}
                  className={styles.gameLogo}
                  onLoad={() => handleImageLoad(`${currentGame.id}-logo`)}
                />
              )}

              <h1 className={styles.gameTitle}>{currentGame.title}</h1>
              <h2 className={styles.gameSubtitle}>{currentGame.subtitle}</h2>
              <p className={styles.dateRange}>{currentGame.dateRange}</p>
              <p className={styles.description}>{currentGame.description}</p>

              {currentGame.price && (
                <div className={styles.priceContainer}>
                  {currentGame.discount && (
                    <span className={styles.discount}>
                      -{currentGame.discount}
                    </span>
                  )}
                  <div className={styles.priceGroup}>
                    {currentGame.originalPrice && (
                      <span className={styles.originalPrice}>
                        {currentGame.originalPrice}
                      </span>
                    )}
                    <span className={styles.currentPrice}>
                      {currentGame.price}
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.actionButtons}>
                <button
                  className={styles.primaryButton}
                  onClick={() => handlePrimaryClick(currentGame)}
                >
                  <ShoppingCart className={styles.buttonIcon} />
                  {currentGame.ctaText}
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => handleSecondaryClick(currentGame)}
                >
                  <Heart className={styles.buttonIcon} />
                  {currentGame.ctaSecondary}
                </button>
              </div>
            </div>

            {/* Navigation Controls */}
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={() =>
                goToSlide(
                  currentSlide === 0
                    ? featuredGames.length - 1
                    : currentSlide - 1
                )
              }
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={() =>
                goToSlide((currentSlide + 1) % featuredGames.length)
              }
              aria-label="Next slide"
            >
              <ChevronRight />
            </button>

            {/* Play/Pause Button */}
            <button
              className={styles.playPauseButton}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
            >
              {isAutoPlaying ? <Pause /> : <Play />}
            </button>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className={styles.thumbnailNav}>
          <div className={styles.thumbnailList}>
            {featuredGames.map((game, index) => (
              <ThumbnailItem
                key={game.id}
                game={game}
                isActive={index === currentSlide}
                onClick={() => goToSlide(index)}
                progress={index === currentSlide ? progress : 0}
                onImageLoad={() => handleImageLoad(`${game.id}-thumb`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Dots Indicator */}
      <div className={styles.mobileDotsContainer}>
        {featuredGames.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${
              index === currentSlide ? styles.activeDot : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Memoized Thumbnail Component
const ThumbnailItem = ({ game, isActive, onClick, progress, onImageLoad }) => (
  <div
    className={`${styles.thumbnailItem} ${
      isActive ? styles.activeThumbnail : ""
    }`}
    onClick={onClick}
  >
    <div className={styles.thumbnailImageContainer}>
      <img
        src={game.thumbnail || "/placeholder.svg?height=80&width=80"}
        alt={game.title}
        className={styles.thumbnailImage}
        onLoad={onImageLoad}
        onError={(e) => {
          e.target.src = "/placeholder.svg?height=80&width=80";
        }}
      />
      {isActive && (
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      )}
    </div>
    <div className={styles.thumbnailContent}>
      <h4 className={styles.thumbnailTitle}>{game.title}</h4>
      <p className={styles.thumbnailSubtitle}>{game.subtitle}</p>
    </div>
  </div>
);

// Loading Skeleton Component
const CarouselSkeleton = () => (
  <div className={styles.carousel}>
    <div className={styles.container}>
      <div className={styles.skeletonMain}>
        <div className={styles.skeletonContent}>
          <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
          <div
            className={`${styles.skeletonLine} ${styles.skeletonSubtitle}`}
          />
          <div
            className={`${styles.skeletonLine} ${styles.skeletonDescription}`}
          />
          <div className={styles.skeletonButtons}>
            <div className={styles.skeletonButton} />
            <div className={styles.skeletonButton} />
          </div>
        </div>
      </div>
      <div className={styles.skeletonThumbnails}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonThumbnail} />
        ))}
      </div>
    </div>
  </div>
);

export default FeaturedCarousel;
