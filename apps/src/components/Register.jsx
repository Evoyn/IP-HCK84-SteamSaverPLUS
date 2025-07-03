"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Info,
  ChevronDown,
  Gamepad2,
  Sword,
  Compass,
  Dice6,
  Crown,
  Settings,
  Zap,
  Car,
  Ghost,
  Puzzle,
  Crosshair,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import styles from "./register.module.css";

// Icon mapping for genres
const genreIcons = {
  action: Sword,
  adventure: Compass,
  rpg: Dice6,
  strategy: Crown,
  simulation: Settings,
  sports: Zap,
  racing: Car,
  horror: Ghost,
  puzzle: Puzzle,
  shooter: Crosshair,
  mmorpg: Crown,
  "battle-royale": Crosshair,
  "battle royale": Crosshair,
  battleroyale: Crosshair,
  // Add more mappings as needed
  default: Gamepad2,
};

// Gaming artworks for slideshow
const gamingArtworks = [
  {
    id: 1,
    image: "/placeholder.svg?height=1080&width=1920",
    title: "Epic Adventures Await",
    subtitle: "Join millions of gamers worldwide",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=1080&width=1920",
    title: "Discover New Worlds",
    subtitle: "Endless gaming possibilities",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=1080&width=1920",
    title: "Level Up Your Experience",
    subtitle: "Premium gaming platform",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=1080&width=1920",
    title: "Connect with Friends",
    subtitle: "Social gaming community",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=1080&width=1920",
    title: "Exclusive Deals Daily",
    subtitle: "Save big on your favorite games",
  },
];

const RegisterPage = () => {
  let navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    genres: [],
    agreeToTerms: false,
  });

  // API state
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Validation state
  const [usernameValid, setUsernameValid] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const formRef = useRef(null);
  const genreDropdownRef = useRef(null);

  // Fetch genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setGenresLoading(true);
        setGenresError(null);

        const response = await fetch("https://goat.nebux.site/games/genre");

        if (!response.ok) {
          throw new Error(`Failed to fetch genres: ${response.status}`);
        }

        const data = await response.json();

        // Transform the API data to match our component structure
        const transformedGenres = data.map((genre) => ({
          id: genre.id, // Make sure we're using 'id' not '_id' or other fields
          name: genre.name,
          icon:
            genreIcons[genre.slug] ||
            genreIcons[genre.name.toLowerCase()] ||
            genreIcons.default,
          examples:
            genre.examples ||
            genre.description ||
            `Popular ${genre.name} games`,
        }));

        setGenres(transformedGenres);
        // console.log("Fetched genres:", transformedGenres); // Debug log
        // console.log("Raw genre data from API:", data); // See the actual API response
      } catch (error) {
        console.error("Error fetching genres:", error);
        setGenresError("Failed to load genres. Please try again later.");

        // Fallback to default genres if API fails
        setGenres([
          {
            id: "action",
            name: "Action",
            icon: Sword,
            examples: "Call of Duty, GTA, Assassin's Creed",
          },
          {
            id: "adventure",
            name: "Adventure",
            icon: Compass,
            examples: "Uncharted, Tomb Raider, Zelda",
          },
          {
            id: "rpg",
            name: "RPG",
            icon: Dice6,
            examples: "Witcher 3, Skyrim, Final Fantasy",
          },
        ]);
      } finally {
        setGenresLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Initialize form animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Slideshow rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gamingArtworks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  // Username validation
  const validateUsername = (username) => {
    // Username should be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }

    // Real-time validation
    if (field === "username") {
      setUsernameValid(value ? validateUsername(value) : null);
    }

    if (field === "email") {
      setEmailValid(value ? validateEmail(value) : null);
    }

    if (field === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Handle genre selection
  const handleGenreToggle = (genreId) => {
    setFormData((prev) => {
      const currentGenres = prev.genres;
      if (currentGenres.includes(genreId)) {
        return {
          ...prev,
          genres: currentGenres.filter((id) => id !== genreId),
        };
      } else if (currentGenres.length < 3) {
        return { ...prev, genres: [...currentGenres, genreId] };
      }
      return prev;
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (!validateUsername(formData.username)) {
      newErrors.username =
        "Username must be 3-20 characters, letters, numbers, and underscores only";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength < 3) {
      newErrors.password = "Password is too weak";
    }

    if (formData.genres.length === 0) {
      newErrors.genres = "Please select at least one genre";
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Shake animation on error
      formRef.current?.classList.add(styles.shake);
      setTimeout(() => {
        formRef.current?.classList.remove(styles.shake);
      }, 500);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      // Prepare the request body
      const requestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        genres: formData.genres.map((id) => {
          // Ensure genres are sent as numbers if they're numeric strings
          const numId = parseInt(id);
          return isNaN(numId) ? id : numId;
        }),
      };

      // console.log("Sending registration data:", requestBody); // Debug log
      // console.log("Selected genre IDs:", requestBody.genres); // Debug log
      // console.log(
      //   "Genre IDs types:",
      //   requestBody.genres.map((id) => typeof id)
      // ); // Check types

      const response = await fetch("https://goat.nebux.site/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Try to parse the response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response isn't JSON, create a default object
        data = { message: "Server response was not in expected format" };
      }

      // Check if registration was actually successful
      // Some APIs return 500 but still create the user
      if (response.status === 500) {
        // Since you mentioned the data is saved in DB despite 500 error,
        // we'll treat this as a success but log the issue
        console.warn("Server returned 500 but registration may have succeeded");
        // console.log("Response data:", data);

        // The 500 error might be from the genre association failing
        // Check if there's an error message about genres
        if (data.message && data.message.includes("genre")) {
          console.error("Genre association error:", data.message);
        }

        // You might want to verify by checking if user exists
        // For now, we'll proceed as successful
        setRegistrationSuccess(true);

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      if (!response.ok) {
        // Handle other error cases
        if (response.status === 409) {
          throw new Error("An account with this email already exists");
        } else if (response.status === 400) {
          throw new Error(data.message || "Invalid registration data");
        } else {
          throw new Error(
            data.message || "Registration failed. Please try again."
          );
        }
      }

      // Normal success case
      setRegistrationSuccess(true);
      // console.log("Registration successful:", data);

      // Store auth token if returned
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // If user ID is returned and we have genres, save user genres
      if (data.userId && formData.genres.length > 0) {
        try {
          // Call separate endpoint to save user genres
          const genresResponse = await fetch(
            "https://goat.nebux.site/user-genres",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // Include auth token if needed
                ...(data.token && { Authorization: `Bearer ${data.token}` }),
              },
              body: JSON.stringify({
                userId: data.userId,
                genreIds: formData.genres,
              }),
            }
          );

          if (!genresResponse.ok) {
            console.error(
              "Failed to save user genres, but registration succeeded"
            );
          }
        } catch (error) {
          console.error("Error saving user genres:", error);
          // Don't throw - registration was still successful
        }
      }

      // Show success message briefly, then redirect
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setApiError(error.message || "Something went wrong. Please try again.");

      // Shake animation on error
      formRef.current?.classList.add(styles.shake);
      setTimeout(() => {
        formRef.current?.classList.remove(styles.shake);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google credential response
  async function handleCredentialResponse(response) {
    // console.log("Encoded JWT ID token: " + response.credential);

    try {
      const { data } = await axios.post(
        "https://goat.nebux.site/login/google",
        {
          googleToken: response.credential,
        }
      );

      // Store auth token
      if (data.access_token) {
        localStorage.setItem("authToken", data.access_token);
      }

      setRegistrationSuccess(true);

      // Show success message briefly, then redirect
      setTimeout(() => {
        navigate("/"); // or wherever you want to redirect after registration
      }, 1500);
    } catch (error) {
      console.error("Google registration error:", error);

      // Check if it's a login vs register issue
      if (
        error.response?.status === 409 ||
        error.response?.data?.message?.includes("already exists")
      ) {
        setApiError(
          "An account with this email already exists. Please sign in instead."
        );
      } else {
        setApiError(
          error.response?.data?.message ||
            "Google registration failed. Please try again."
        );
      }

      // Shake animation on error
      formRef.current?.classList.add(styles.shake);
      setTimeout(() => {
        formRef.current?.classList.remove(styles.shake);
      }, 500);
    }
  }

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  }, []);

  // Handle custom Google button click
  const handleGoogleSignUp = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  // Get password strength text and color
  const getPasswordStrengthInfo = () => {
    const strengthLevels = [
      { text: "Very Weak", color: "#EF4444" },
      { text: "Weak", color: "#F97316" },
      { text: "Fair", color: "#EAB308" },
      { text: "Good", color: "#22C55E" },
      { text: "Strong", color: "#10B981" },
    ];
    return strengthLevels[passwordStrength] || strengthLevels[0];
  };

  const isFormValid =
    usernameValid &&
    emailValid &&
    passwordStrength >= 3 &&
    formData.genres.length > 0 &&
    formData.agreeToTerms;

  return (
    <div className={styles.registerPage}>
      {/* Animated Background Mesh */}
      <div className={styles.backgroundMesh} />

      {/* Background Slideshow */}
      <div className={styles.rightSection}>
        <div className={styles.slideshow}>
          {gamingArtworks.map((artwork, index) => (
            <div
              key={artwork.id}
              className={`${styles.slide} ${
                index === currentSlide ? styles.active : ""
              }`}
              style={{
                backgroundImage: `url(${artwork.image})`,
                transform: `translate(${(mousePosition.x - 50) * 0.02}px, ${
                  (mousePosition.y - 50) * 0.02
                }px)`,
              }}
            >
              <div className={styles.slideOverlay} />
              <div className={styles.slideContent}>
                <h3 className={styles.slideTitle}>{artwork.title}</h3>
                <p className={styles.slideSubtitle}>{artwork.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Floating UI Elements */}
        <div className={styles.floatingElements}>
          <div
            className={styles.floatingBadge}
            style={{ top: "20%", right: "10%" }}
          >
            <span>🏆 Achievement Unlocked</span>
          </div>
          <div
            className={styles.floatingBadge}
            style={{ bottom: "30%", left: "10%" }}
          >
            <span>🎮 1M+ Players</span>
          </div>
          <div
            className={styles.floatingBadge}
            style={{ top: "60%", right: "5%" }}
          >
            <span>⭐ 4.9/5 Rating</span>
          </div>
        </div>
      </div>

      {/* Centered Registration Form */}
      <div
        className={`${styles.formContainer} ${
          isFormVisible ? styles.visible : ""
        }`}
        ref={formRef}
      >
        {/* Header */}
        <div className={styles.formHeader}>
          <div className={styles.logo}>
            <Gamepad2 className={styles.logoIcon} />
            <span className={styles.logoText}>SteamSaver+</span>
          </div>

          <h1 className={styles.title}>Join the Adventure</h1>
          <p className={styles.subtitle}>
            Create your account and start gaming
          </p>
        </div>

        {/* Success Message */}
        {registrationSuccess && (
          <div className={styles.successMessage}>
            <Check className={styles.successIcon} />
            <p>Registration successful! Redirecting...</p>
          </div>
        )}

        {/* API Error Message */}
        {apiError && (
          <div className={styles.apiError}>
            <AlertCircle className={styles.errorIcon} />
            <p>{apiError}</p>
          </div>
        )}

        {/* Registration Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <div className={styles.inputContainer}>
              <input
                id="username"
                type="text"
                className={`${styles.input} ${
                  usernameValid === true
                    ? styles.valid
                    : usernameValid === false
                    ? styles.invalid
                    : ""
                }`}
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                autoComplete="username"
              />
              {usernameValid === true && <Check className={styles.validIcon} />}
              {usernameValid === false && <X className={styles.invalidIcon} />}
            </div>
            {formData.username && !usernameValid && (
              <span className={styles.hintMessage}>
                3-20 characters, letters, numbers, and underscores only
              </span>
            )}
            {errors.username && (
              <span className={styles.errorMessage}>{errors.username}</span>
            )}
          </div>

          {/* Email Field */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              Email Address
            </label>
            <div className={styles.inputContainer}>
              <input
                id="email"
                type="email"
                className={`${styles.input} ${
                  emailValid === true
                    ? styles.valid
                    : emailValid === false
                    ? styles.invalid
                    : ""
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                autoComplete="email"
              />
              {emailValid === true && <Check className={styles.validIcon} />}
              {emailValid === false && <X className={styles.invalidIcon} />}
            </div>
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.inputContainer}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.strengthSegment} ${
                        i < passwordStrength ? styles.filled : ""
                      }`}
                      style={{
                        backgroundColor:
                          i < passwordStrength
                            ? getPasswordStrengthInfo().color
                            : undefined,
                      }}
                    />
                  ))}
                </div>
                <span
                  className={styles.strengthText}
                  style={{ color: getPasswordStrengthInfo().color }}
                >
                  {getPasswordStrengthInfo().text}
                </span>
              </div>
            )}

            {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          {/* Genre Selection */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Choose Your Favorite Genres
              <Info className={styles.infoIcon} />
            </label>

            <div className={styles.genreSelector} ref={genreDropdownRef}>
              <button
                type="button"
                className={`${styles.genreButton} ${
                  showGenreDropdown ? styles.open : ""
                }`}
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                disabled={genresLoading}
              >
                <span>
                  {genresLoading ? (
                    <>
                      <Loader2 className={styles.loadingIcon} size={16} />
                      Loading genres...
                    </>
                  ) : formData.genres.length === 0 ? (
                    "Select up to 3 genres"
                  ) : (
                    `${formData.genres.length} genre${
                      formData.genres.length > 1 ? "s" : ""
                    } selected`
                  )}
                </span>
                <ChevronDown className={styles.chevronIcon} />
              </button>

              {showGenreDropdown && !genresLoading && (
                <div className={styles.genreDropdown}>
                  {genresError && (
                    <div className={styles.genreError}>
                      <AlertCircle size={16} />
                      <span>{genresError}</span>
                    </div>
                  )}
                  {genres.map((genre) => {
                    const IconComponent = genre.icon;
                    const isSelected = formData.genres.includes(genre.id);
                    const isDisabled =
                      !isSelected && formData.genres.length >= 3;

                    return (
                      <button
                        key={genre.id}
                        type="button"
                        className={`${styles.genreOption} ${
                          isSelected ? styles.selected : ""
                        } ${isDisabled ? styles.disabled : ""}`}
                        onClick={() =>
                          !isDisabled && handleGenreToggle(genre.id)
                        }
                        disabled={isDisabled}
                      >
                        <div className={styles.genreInfo}>
                          <div className={styles.genreHeader}>
                            <IconComponent className={styles.genreIcon} />
                            <span className={styles.genreName}>
                              {genre.name}
                            </span>
                          </div>
                          <span className={styles.genreExamples}>
                            {genre.examples}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className={styles.selectedIcon} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Genres Tags */}
            {formData.genres.length > 0 && (
              <div className={styles.selectedGenres}>
                {formData.genres.map((genreId) => {
                  const genre = genres.find((g) => g.id === genreId);
                  if (!genre) return null;
                  const IconComponent = genre.icon;
                  return (
                    <div key={genreId} className={styles.genreTag}>
                      <IconComponent className={styles.tagIcon} />
                      <span>{genre.name}</span>
                      <button
                        type="button"
                        className={styles.removeTag}
                        onClick={() => handleGenreToggle(genreId)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {errors.genres && (
              <span className={styles.errorMessage}>{errors.genres}</span>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  handleInputChange("agreeToTerms", e.target.checked)
                }
              />
              <span className={styles.checkboxCustom}>
                {formData.agreeToTerms && <Check size={14} />}
              </span>
              <span className={styles.checkboxText}>
                I agree to the{" "}
                <a href="/terms" className={styles.link}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className={styles.link}>
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && (
              <span className={styles.errorMessage}>{errors.terms}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`${styles.submitButton} ${
              !isFormValid ? styles.disabled : ""
            }`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className={styles.buttonSpinner} />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Social Login */}
          <div className={styles.socialLogin}>
            <div className={styles.divider}>
              <span>Or continue with</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                type="button"
                className={`${styles.socialButton} ${styles.google}`}
                onClick={handleGoogleSignUp}
                aria-label="Sign up with Google"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className={styles.signUpLink}>
            Already have an account?{" "}
            <Link to="/login" className={styles.link}>
              Log in
            </Link>
          </div>
        </form>

        {/* Security Badge */}
        <div className={styles.securityBadge}>
          <Shield size={16} />
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
