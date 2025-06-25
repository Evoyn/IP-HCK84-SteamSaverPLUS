"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import styles from "./register.module.css";

// Genre options with icons and examples
const genres = [
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
  {
    id: "strategy",
    name: "Strategy",
    icon: Crown,
    examples: "Civilization, StarCraft, Age of Empires",
  },
  {
    id: "simulation",
    name: "Simulation",
    icon: Settings,
    examples: "Cities Skylines, The Sims, Euro Truck",
  },
  {
    id: "sports",
    name: "Sports",
    icon: Zap,
    examples: "FIFA, NBA 2K, Rocket League",
  },
  {
    id: "racing",
    name: "Racing",
    icon: Car,
    examples: "Forza, Gran Turismo, Need for Speed",
  },
  {
    id: "horror",
    name: "Horror",
    icon: Ghost,
    examples: "Resident Evil, Silent Hill, Dead Space",
  },
  {
    id: "puzzle",
    name: "Puzzle",
    icon: Puzzle,
    examples: "Portal, Tetris, Monument Valley",
  },
  {
    id: "shooter",
    name: "Shooter",
    icon: Crosshair,
    examples: "Counter-Strike, Overwatch, Valorant",
  },
];

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
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    genres: [],
    agreeToTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Validation state
  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});

  const formRef = useRef(null);
  const genreDropdownRef = useRef(null);

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

    // Real-time validation
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

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Success - trigger confetti and redirect
      console.log("Registration successful:", formData);
      // In real app: redirect to dashboard or email verification
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
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

          {/* Progress Indicator
          <div className={styles.progressIndicator}>
            <div className={`${styles.progressDot} ${styles.active}`} />
            <div className={styles.progressDot} />
            <div className={styles.progressDot} />
          </div> */}
        </div>

        {/* Registration Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
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
              >
                <span>
                  {formData.genres.length === 0
                    ? "Select up to 3 genres"
                    : `${formData.genres.length} genre${
                        formData.genres.length > 1 ? "s" : ""
                      } selected`}
                </span>
                <ChevronDown className={styles.chevronIcon} />
              </button>

              {showGenreDropdown && (
                <div className={styles.genreDropdown}>
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
            {isLoading ? <div className={styles.spinner} /> : "Create Account"}
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
              >
                <span>G</span>
              </button>
              <button
                type="button"
                className={`${styles.socialButton} ${styles.steam}`}
              >
                <span>S</span>
              </button>
              <button
                type="button"
                className={`${styles.socialButton} ${styles.discord}`}
              >
                <span>D</span>
              </button>
              <button
                type="button"
                className={`${styles.socialButton} ${styles.xbox}`}
              >
                <span>X</span>
              </button>
            </div>
          </div>

          {/* Sign In Link */}
          <div className={styles.signInLink}>
            Already gaming with us?{" "}
            <a href="/login" className={styles.link}>
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
