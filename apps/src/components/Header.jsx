"use client";

import { useState } from "react";
import { Search, Compass, Heart, User, Menu, X, Gamepad2 } from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => setIsSearchFocused(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <a href="/" className={styles.logo}>
            <Gamepad2 className={styles.logoIcon} />
            <span className={styles.logoText}>SteamSaver+</span>
          </a>
        </div>

        {/* Search Section */}
        <div
          className={`${styles.searchSection} ${
            isSearchFocused ? styles.searchExpanded : ""
          }`}
        >
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search games, deals, genres..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <button className={styles.navButton}>
            <Compass className={styles.navIcon} />
            <span>Discover</span>
          </button>
          <button className={styles.navButton}>
            <Heart className={styles.navIcon} />
            <span>Wishlist</span>
          </button>
          <button className={styles.signInButton}>
            <User className={styles.signInIcon} />
            <span>Sign In</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          <button className={styles.mobileNavButton}>
            <Compass className={styles.navIcon} />
            <span>Discover</span>
          </button>
          <button className={styles.mobileNavButton}>
            <Heart className={styles.navIcon} />
            <span>Wishlist</span>
          </button>
          <button className={styles.mobileSignInButton}>
            <User className={styles.signInIcon} />
            <span>Sign In</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
