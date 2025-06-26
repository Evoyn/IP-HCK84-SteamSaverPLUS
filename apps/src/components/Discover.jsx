"use client";

import React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Grid3X3,
  List,
} from "lucide-react";
import styles from "./Discover.module.css";

// Mock data for games (you'll replace this with your API)
const mockGames = [
  {
    id: 1,
    title: "Stellar Blade",
    category: "Base Game",
    originalPrice: 879000,
    currentPrice: 879000,
    discount: 0,
    currency: "IDR",
    image: "/placeholder.svg?height=260&width=220",
    genre: ["Action", "RPG"],
    releaseDate: "2024-04-26",
    rating: 4.8,
    reviews: 15420,
    isFree: false,
    isNew: true,
  },
  {
    id: 2,
    title: "RoadCraft",
    category: "Base Game",
    originalPrice: 499000,
    currentPrice: 349000,
    discount: 30,
    currency: "IDR",
    image: "/placeholder.svg?height=260&width=220",
    genre: ["Simulation", "Building"],
    releaseDate: "2024-03-15",
    rating: 4.3,
    reviews: 8750,
    isFree: false,
    isNew: false,
  },
  {
    id: 3,
    title: "The Alters",
    category: "Base Game",
    originalPrice: 284999,
    currentPrice: 256499,
    discount: 10,
    currency: "IDR",
    image: "/placeholder.svg?height=260&width=220",
    genre: ["Adventure", "Sci-Fi"],
    releaseDate: "2024-02-20",
    rating: 4.6,
    reviews: 12300,
    isFree: false,
    isNew: false,
  },
  {
    id: 4,
    title: "JDM: Japanese Drift Master",
    category: "Base Game",
    originalPrice: 699000,
    currentPrice: 499000,
    discount: 29,
    currency: "IDR",
    image: "/placeholder.svg?height=260&width=220",
    genre: ["Racing", "Simulation"],
    releaseDate: "2024-01-10",
    rating: 4.7,
    reviews: 9850,
    isFree: false,
    isNew: false,
  },
  {
    id: 5,
    title: "Blades of Fire",
    category: "Base Game",
    originalPrice: 599999,
    currentPrice: 449999,
    discount: 25,
    currency: "IDR",
    image: "/placeholder.svg?height=260&width=220",
    genre: ["RPG", "Fantasy"],
    releaseDate: "2023-12-05",
    rating: 4.9,
    reviews: 23400,
    isFree: false,
    isNew: false,
  },
  {
    id: 6,
    title: "Splitgate 2",
    category: "Base Game",
    originalPrice: 0,
    currentPrice: 0,
    discount: 0,
    currency: "IDR",
    image: "/placeholder.svg?height=260&width=220",
    genre: ["FPS", "Multiplayer"],
    releaseDate: "2024-05-01",
    rating: 4.5,
    reviews: 18700,
    isFree: true,
    isNew: true,
  },
  // Add more mock games to demonstrate pagination
  ...Array.from({ length: 50 }, (_, i) => ({
    id: i + 7,
    title: `Game ${i + 7}`,
    category: "Base Game",
    originalPrice: Math.floor(Math.random() * 1000000) + 100000,
    currentPrice: Math.floor(Math.random() * 800000) + 50000,
    discount: Math.floor(Math.random() * 80),
    currency: "IDR",
    image: "/placeholder.svg?height=260&width=220",
    genre: ["Action", "Adventure", "RPG", "Strategy", "Simulation"][
      Math.floor(Math.random() * 5)
    ],
    releaseDate: new Date(
      2020 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split("T")[0],
    rating: 3 + Math.random() * 2,
    reviews: Math.floor(Math.random() * 50000) + 1000,
    isFree: Math.random() > 0.8,
    isNew: Math.random() > 0.7,
  })),
];

const genres = [
  "All Genres",
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
  "Sports",
  "Racing",
  "Horror",
  "Puzzle",
  "Shooter",
  "FPS",
  "Multiplayer",
  "Building",
  "Sci-Fi",
  "Fantasy",
];

const sortOptions = [
  { value: "newest", label: "Newest First", icon: Calendar },
  { value: "oldest", label: "Oldest First", icon: Calendar },
  { value: "price-low", label: "Price: Low to High", icon: SortAsc },
  { value: "price-high", label: "Price: High to Low", icon: SortDesc },
  { value: "rating", label: "Highest Rated", icon: Star },
  { value: "discount", label: "Biggest Discount", icon: Tag },
];

const ITEMS_PER_PAGE = 12;

const DiscoverPage = () => {
  // State management
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  const searchInputRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const genreDropdownRef = useRef(null);

  // Initialize data
  useEffect(() => {
    // Simulate API call
    const loadGames = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setGames(mockGames);
      setIsLoading(false);
    };
    loadGames();
  }, []);

  // Filter and sort games
  useEffect(() => {
    let filtered = [...games];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.genre.some((g) =>
            g.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply genre filter
    if (selectedGenre !== "All Genres") {
      filtered = filtered.filter((game) => game.genre.includes(selectedGenre));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        case "oldest":
          return new Date(a.releaseDate) - new Date(b.releaseDate);
        case "price-low":
          return a.currentPrice - b.currentPrice;
        case "price-high":
          return b.currentPrice - a.currentPrice;
        case "rating":
          return b.rating - a.rating;
        case "discount":
          return b.discount - a.discount;
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [games, searchQuery, selectedGenre, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Handle clear search
  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target)
      ) {
        setShowGenreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format price
  const formatPrice = (price) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return <DiscoverSkeleton />;
  }

  return (
    <div className={styles.discoverPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Discover Games</h1>
            <p className={styles.subtitle}>
              Find your next favorite game from our collection of {games.length}{" "}
              titles
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                viewMode === "grid" ? styles.active : ""
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Grid3X3 size={20} />
            </button>
            <button
              className={`${styles.viewButton} ${
                viewMode === "list" ? styles.active : ""
              }`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List size={20} />
            </button>
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
              placeholder="Search games, genres..."
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
            {/* Genre Filter */}
            <div className={styles.filterGroup} ref={genreDropdownRef}>
              <button
                className={`${styles.filterButton} ${
                  showGenreDropdown ? styles.active : ""
                }`}
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
              >
                <Filter size={16} />
                {selectedGenre}
                <ChevronDown className={styles.chevronIcon} />
              </button>

              {showGenreDropdown && (
                <div className={styles.dropdown}>
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      className={`${styles.dropdownItem} ${
                        selectedGenre === genre ? styles.selected : ""
                      }`}
                      onClick={() => {
                        setSelectedGenre(genre);
                        setShowGenreDropdown(false);
                      }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
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
              {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""}{" "}
              found
            </div>
          </div>
        </div>

        {/* Games Grid/List */}
        <div
          className={`${styles.gamesContainer} ${
            viewMode === "list" ? styles.listView : styles.gridView
          }`}
        >
          {currentGames.length > 0 ? (
            currentGames.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                formatPrice={formatPrice}
                viewMode={viewMode}
                index={index}
              />
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
                  setSelectedGenre("All Genres");
                  setSortBy("newest");
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
const GameCard = ({ game, formatPrice, viewMode, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={`${styles.gameCard} ${
        viewMode === "list" ? styles.listCard : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <img
          src={game.image || "/placeholder.svg"}
          alt={game.title}
          className={`${styles.gameImage} ${imageLoaded ? styles.loaded : ""}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className={styles.badges}>
          {game.isNew && <div className={styles.newBadge}>NEW</div>}
          {game.discount > 0 && (
            <div className={styles.discountBadge}>-{game.discount}%</div>
          )}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className={styles.hoverOverlay}>
            <div className={styles.quickActions}>
              <button className={styles.quickAction}>Add to Cart</button>
              <button className={styles.quickAction}>Wishlist</button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={styles.category}>{game.category}</span>
          <div className={styles.rating}>
            <Star className={styles.starIcon} />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className={styles.gameTitle}>{game.title}</h3>

        {/* <div className={styles.genres}>
          {game.genre.slice(0, 2).map((genre, i) => (
            <span key={i} className={styles.genreTag}>
              {genre}
            </span>
          ))}
        </div> */}

        <div className={styles.priceSection}>
          {game.isFree ? (
            <div className={styles.freePrice}>Free</div>
          ) : game.discount > 0 ? (
            <div className={styles.discountedPrice}>
              <span className={styles.originalPrice}>
                {formatPrice(game.originalPrice)}
              </span>
              <span className={styles.currentPrice}>
                {formatPrice(game.currentPrice)}
              </span>
            </div>
          ) : (
            <div className={styles.regularPrice}>
              {formatPrice(game.currentPrice)}
            </div>
          )}
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
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>

      <div className={styles.searchSection}>
        <div className={styles.skeletonSearch} />
        <div className={styles.filtersRow}>
          <div className={styles.skeletonFilter} />
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
