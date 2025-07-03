"use client";

import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Calendar,
  Tag,
} from "lucide-react";
import styles from "./Discover.module.css";

const ITEMS_PER_PAGE = 10;

const sortOptions = [
  { value: "newest", label: "Newest First", icon: Calendar },
  { value: "oldest", label: "Oldest First", icon: Calendar },
  { value: "title-asc", label: "Title: A to Z", icon: SortAsc },
  { value: "title-desc", label: "Title: Z to A", icon: SortDesc },
  { value: "genre", label: "Group by Genre", icon: Tag },
];

const DiscoverPage = () => {
  // State management
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [expandedGenres, setExpandedGenres] = useState(new Set());
  const [groupedGames, setGroupedGames] = useState({});

  const searchInputRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoadingGenres(true);
        const response = await axios.get("https://goat.nebux.site/games/genre");
        setGenres(response.data);
      } catch (err) {
        console.error("Error fetching genres:", err);
        setError("Failed to load genres");
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = {
          page: currentPage,
        };

        // Add search query if present
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await axios.get("https://goat.nebux.site/pub-games", {
          params,
        });
        const data = response.data;

        // Update state with API response
        setGames(data.data || []);
        setTotalPages(data.totalPage || 1);
        setTotalGames(data.totalData || 0);

        // Apply client-side sorting
        let sortedGames = [...(data.data || [])];

        if (sortBy !== "genre") {
          sortedGames.sort((a, b) => {
            switch (sortBy) {
              case "newest":
                return new Date(b.release_date) - new Date(a.release_date);
              case "oldest":
                return new Date(a.release_date) - new Date(b.release_date);
              case "title-asc":
                return a.title.localeCompare(b.title);
              case "title-desc":
                return b.title.localeCompare(a.title);
              default:
                return 0;
            }
          });
        }

        setFilteredGames(sortedGames);

        // Group games by genre if that sorting is selected
        if (sortBy === "genre") {
          const grouped = sortedGames.reduce((acc, game) => {
            const genre = game.genre || "Other";
            if (!acc[genre]) {
              acc[genre] = [];
            }
            acc[genre].push(game);
            return acc;
          }, {});

          // Sort games within each genre by title
          Object.keys(grouped).forEach((genre) => {
            grouped[genre].sort((a, b) => a.title.localeCompare(b.title));
          });

          setGroupedGames(grouped);
          // Expand all genres by default when switching to genre view
          setExpandedGenres(new Set(Object.keys(grouped)));
        }
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Failed to load games. Please try again later.");
        setGames([]);
        setFilteredGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [currentPage, searchQuery, sortBy]);

  // Handle search with debounce
  const debounceTimer = useRef(null);
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
  }, []);

  // Handle clear search
  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    searchInputRef.current?.focus();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort change
  const handleSortChange = (sort) => {
    setSortBy(sort);
    setShowSortDropdown(false);
  };

  // Toggle all genres
  const toggleAllGenres = (expand) => {
    if (expand) {
      setExpandedGenres(new Set(Object.keys(groupedGames)));
    } else {
      setExpandedGenres(new Set());
    }
  };

  // Toggle genre expansion
  const toggleGenre = (genre) => {
    const newExpanded = new Set(expandedGenres);
    if (newExpanded.has(genre)) {
      newExpanded.delete(genre);
    } else {
      newExpanded.add(genre);
    }
    setExpandedGenres(newExpanded);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  if (isLoading && games.length === 0) {
    return <DiscoverSkeleton />;
  }

  if (error && games.length === 0) {
    return (
      <div className={styles.discoverPage}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.discoverPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Discover Games</h1>
            <p className={styles.subtitle}>
              Find your next favorite game from our collection of {totalGames}{" "}
              free-to-play titles
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={styles.searchSection}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search games by title..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={clearSearch}>
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className={styles.filtersRow}>
            {/* Sort Filter */}
            <div className={styles.filterGroup} ref={sortDropdownRef}>
              <button
                className={`${styles.filterButton} ${
                  showSortDropdown ? styles.active : ""
                }`}
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                {sortOptions.find((option) => option.value === sortBy)?.icon &&
                  React.createElement(
                    sortOptions.find((option) => option.value === sortBy).icon,
                    { size: 16 }
                  )}
                {sortOptions.find((option) => option.value === sortBy)?.label}
                <ChevronDown className={styles.chevronIcon} />
              </button>

              {showSortDropdown && (
                <div className={styles.dropdown}>
                  {sortOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        className={`${styles.dropdownItem} ${
                          sortBy === option.value ? styles.selected : ""
                        }`}
                        onClick={() => handleSortChange(option.value)}
                      >
                        <IconComponent size={16} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className={styles.resultsCount}>
              {totalGames} game{totalGames !== 1 ? "s" : ""} found
              {sortBy === "genre" && Object.keys(groupedGames).length > 0 && (
                <div className={styles.genreControls}>
                  <button
                    className={styles.genreControlBtn}
                    onClick={() => toggleAllGenres(true)}
                  >
                    Expand All
                  </button>
                  <button
                    className={styles.genreControlBtn}
                    onClick={() => toggleAllGenres(false)}
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {sortBy === "genre" && !isLoading ? (
          <div className={styles.genreGroupsContainer}>
            {Object.entries(groupedGames)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([genre, gamesInGenre]) => (
                <div key={genre} className={styles.genreGroup}>
                  <button
                    className={styles.genreHeader}
                    onClick={() => toggleGenre(genre)}
                  >
                    <div className={styles.genreHeaderLeft}>
                      <ChevronDown
                        className={`${styles.genreChevron} ${
                          !expandedGenres.has(genre) ? styles.collapsed : ""
                        }`}
                      />
                      <h2 className={styles.genreTitle}>{genre}</h2>
                      <span className={styles.genreCount}>
                        ({gamesInGenre.length} game
                        {gamesInGenre.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </button>

                  {expandedGenres.has(genre) && (
                    <div className={styles.gamesContainer}>
                      {gamesInGenre.map((game, index) => (
                        <GameCard key={game.id} game={game} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className={styles.gamesContainer}>
            {isLoading ? (
              [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))
            ) : filteredGames.length > 0 ? (
              filteredGames.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🎮</div>
                <h3>No games found</h3>
                <p>Try adjusting your search or filters</p>
                <button
                  className={styles.clearFiltersButton}
                  onClick={() => {
                    setSearchQuery("");
                    setSortBy("newest");
                    setCurrentPage(1);
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination - only show when not grouping by genre */}
        {totalPages > 1 && sortBy !== "genre" && (
          <div className={styles.pagination}>
            <button
              className={`${styles.pageButton} ${
                currentPage === 1 ? styles.disabled : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageNumber} ${
                      currentPage === pageNum ? styles.active : ""
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className={`${styles.pageButton} ${
                currentPage === totalPages ? styles.disabled : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format release date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Check if game is new (released within last 30 days)
  const isNewGame = () => {
    try {
      const releaseDate = new Date(game.release_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return releaseDate > thirtyDaysAgo;
    } catch {
      return false;
    }
  };

  return (
    <div
      className={styles.gameCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <img
          src={imageError ? "/placeholder.svg" : game.thumbnail}
          alt={game.title}
          className={`${styles.gameImage} ${imageLoaded ? styles.loaded : ""}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className={styles.badges}>
          {isNewGame() && <div className={styles.newBadge}>NEW</div>}
          <div className={styles.discountBadge}>FREE</div>
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className={styles.hoverOverlay}>
            <div className={styles.quickActions}>
              <a
                href={game.game_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.quickAction}
              >
                Play Now
              </a>
              <a
                href={game.freetogame_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.quickAction}
              >
                View Details
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={styles.category}>{game.genre}</span>
          <span className={styles.category}>{game.platform}</span>
        </div>

        <h3 className={styles.gameTitle}>{game.title}</h3>

        <div className={styles.priceSection}>
          <div className={styles.freePrice}>Free to Play</div>
          <div className={styles.releaseInfo}>
            <span className={styles.category}>
              Released: {formatDate(game.release_date)}
            </span>
          </div>
        </div>

        <div className={styles.publisherInfo}>
          <span className={styles.category}>Publisher: {game.publisher}</span>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const DiscoverSkeleton = () => (
  <div className={styles.discoverPage}>
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonSubtitle} />
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.skeletonSearch} />
        <div className={styles.filtersRow}>
          <div className={styles.skeletonFilter} />
        </div>
      </div>

      <div className={styles.gamesContainer}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  </div>
);

export default DiscoverPage;
