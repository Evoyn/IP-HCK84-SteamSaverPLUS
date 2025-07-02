"use client";

import { useState, useEffect } from "react";
import { Search, Compass, Heart, User, Menu, X, Gamepad2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router";
import styles from "./Header.module.css";
import {
  selectWishlistCount,
  fetchWishlist,
} from "../store/slices/wishlistSlice";

const Header = () => {
  // const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const dispatch = useDispatch();
  const wishlistCount = useSelector(selectWishlistCount);
  const authToken = localStorage.getItem("authToken");

  // Fetch wishlist when component mounts and user is authenticated
  useEffect(() => {
    if (authToken) {
      // Extract user ID from token (assuming JWT)
      try {
        const tokenPayload = JSON.parse(atob(authToken.split(".")[1]));
        const userId = tokenPayload.id || tokenPayload.userId;
        if (userId) {
          dispatch(fetchWishlist(userId));
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, [authToken, dispatch]);

  // const handleSearchFocus = () => setIsSearchFocused(true);
  // const handleSearchBlur = () => setIsSearchFocused(false);
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
        {/* <div
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
        </div> */}

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/discover" className={styles.navButton}>
            <Compass className={styles.navIcon} />
            <span>Discover</span>
          </Link>

          {authToken ? (
            <>
              <Link to="/wishlist" className={styles.navButton}>
                <div style={{ position: "relative" }}>
                  <Heart className={styles.navIcon} />
                  {wishlistCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#ff4757",
                        color: "white",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        border: "2px solid #1a1a2e",
                      }}
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </div>
                <span>Wishlist</span>
              </Link>
              <Link to="/profile" className={styles.navButton}>
                <User className={styles.navIcon} />
                <span>Profile</span>
              </Link>
              <Link
                to="/login"
                className={styles.signInButton}
                onClick={() => {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("access_token");
                }}
              >
                <User className={styles.signInIcon} />
                <span>Sign Out</span>
              </Link>
            </>
          ) : (
            <Link to="/login" className={styles.signInButton}>
              <User className={styles.signInIcon} />
              <span>Sign In</span>
            </Link>
          )}
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

      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          <Link to="/discover" className={styles.mobileNavButton}>
            <Compass className={styles.navIcon} />
            <span>Discover</span>
          </Link>

          {authToken ? (
            <>
              <Link to="/wishlist" className={styles.mobileNavButton}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div style={{ position: "relative" }}>
                    <Heart className={styles.navIcon} />
                    {wishlistCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#ff4757",
                          color: "white",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "bold",
                          border: "2px solid #1a1a2e",
                        }}
                      >
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </div>
                  <span>Wishlist</span>
                </div>
              </Link>
              <Link to="/profile" className={styles.mobileNavButton}>
                <User className={styles.navIcon} />
                <span>Profile</span>
              </Link>
              <Link
                to="/login"
                className={styles.mobileSignInButton}
                onClick={() => {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("access_token");
                }}
              >
                <User className={styles.signInIcon} />
                <span>Sign Out</span>
              </Link>
            </>
          ) : (
            <Link to="/login" className={styles.mobileSignInButton}>
              <User className={styles.signInIcon} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
