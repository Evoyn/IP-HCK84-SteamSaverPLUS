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
  User,
  Mail,
  Lock,
  Save,
  Edit3,
  Camera,
} from "lucide-react";
import styles from "./profile.module.css";

// Genre options with icons and examples (same as register)
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

// Mock user data (you'll replace this with your API)
const mockUserData = {
  id: "user123",
  username: "GamerPro2024",
  email: "gamer@example.com",
  avatar: "/placeholder.svg?height=120&width=120",
  joinDate: "2024-01-15",
  authProvider: "google", // "email", "google", "steam", "discord", "xbox"
  favoriteGenres: ["action", "rpg"], // Some users might have empty array if registered via OAuth
  stats: {
    gamesOwned: 47,
    hoursPlayed: 1250,
    achievementsUnlocked: 342,
  },
};

const ProfilePage = () => {
  // Form state
  const [userData, setUserData] = useState(mockUserData);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    favoriteGenres: mockUserData.favoriteGenres,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingGenres, setIsEditingGenres] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Validation state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const genreDropdownRef = useRef(null);

  // Initialize form animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormVisible(true);
    }, 300);
    return () => clearTimeout(timer);
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

    // Real-time password strength
    if (field === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Handle genre selection
  const handleGenreToggle = (genreId) => {
    setFormData((prev) => {
      const currentGenres = prev.favoriteGenres;
      if (currentGenres.includes(genreId)) {
        return {
          ...prev,
          favoriteGenres: currentGenres.filter((id) => id !== genreId),
        };
      } else if (currentGenres.length < 3) {
        return { ...prev, favoriteGenres: [...currentGenres, genreId] };
      }
      return prev;
    });
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordStrength < 3) {
      newErrors.newPassword = "Password is too weak";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      setSuccessMessage("Password updated successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setIsEditingPassword(false);
      setPasswordStrength(0);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ general: "Failed to update password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle genre update
  const handleGenreUpdate = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update user data
      setUserData((prev) => ({
        ...prev,
        favoriteGenres: formData.favoriteGenres,
      }));

      setSuccessMessage("Favorite genres updated successfully!");
      setIsEditingGenres(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ genres: "Failed to update genres. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const cancelPasswordEdit = () => {
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setIsEditingPassword(false);
    setPasswordStrength(0);
    setErrors({});
  };

  const cancelGenreEdit = () => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: userData.favoriteGenres,
    }));
    setIsEditingGenres(false);
    setErrors({});
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

  // Get auth provider display name
  const getAuthProviderName = (provider) => {
    const providers = {
      email: "Email",
      google: "Google",
      steam: "Steam",
      discord: "Discord",
      xbox: "Xbox",
    };
    return providers[provider] || "Unknown";
  };

  // Check if user needs to set favorite genres
  const needsGenreSetup = userData.favoriteGenres.length === 0;

  return (
    <div className={styles.profilePage}>
      {/* Animated Background Mesh */}
      <div className={styles.backgroundMesh} />

      {/* Left Section - Profile Form */}
      <div className={styles.leftSection}>
        <div
          className={`${styles.formContainer} ${
            isFormVisible ? styles.visible : ""
          }`}
        >
          {/* Header */}
          <div className={styles.formHeader}>
            <div className={styles.logo}>
              <Gamepad2 className={styles.logoIcon} />
              <span className={styles.logoText}>SteamSaver+</span>
            </div>

            <h1 className={styles.title}>Profile Settings</h1>
            <p className={styles.subtitle}>Manage your account preferences</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={styles.successMessage}>
              <Check className={styles.successIcon} />
              {successMessage}
            </div>
          )}

          {/* Profile Form */}
          <div className={styles.form}>
            {/* Profile Picture Section */}
            <div className={styles.profilePictureSection}>
              <div className={styles.avatarContainer}>
                <img
                  src={userData.avatar || "/placeholder.svg"}
                  alt="Profile"
                  className={styles.avatar}
                />
                <button className={styles.avatarEditButton}>
                  <Camera size={16} />
                </button>
              </div>
              <div className={styles.userInfo}>
                <h3 className={styles.displayName}>{userData.username}</h3>
                <p className={styles.joinDate}>
                  Member since{" "}
                  {new Date(userData.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Account Information</h3>

              {/* Username (Read-only) */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <User className={styles.labelIcon} />
                  Username
                </label>
                <div className={styles.readOnlyField}>
                  <input
                    type="text"
                    value={userData.username}
                    className={styles.readOnlyInput}
                    readOnly
                  />
                  <span className={styles.readOnlyBadge}>Read-only</span>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <Mail className={styles.labelIcon} />
                  Email Address
                </label>
                <div className={styles.readOnlyField}>
                  <input
                    type="email"
                    value={userData.email}
                    className={styles.readOnlyInput}
                    readOnly
                  />
                  <span className={styles.authProviderBadge}>
                    Signed in with {getAuthProviderName(userData.authProvider)}
                  </span>
                </div>
              </div>
            </div>

            {/* Password Section (only for email auth) */}
            {userData.authProvider === "email" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <Lock className={styles.sectionIcon} />
                    Password
                  </h3>
                  {!isEditingPassword && (
                    <button
                      className={styles.editButton}
                      onClick={() => setIsEditingPassword(true)}
                    >
                      <Edit3 size={16} />
                      Change Password
                    </button>
                  )}
                </div>

                {isEditingPassword ? (
                  <form
                    onSubmit={handlePasswordChange}
                    className={styles.passwordForm}
                  >
                    {/* Current Password */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="currentPassword">
                        Current Password
                      </label>
                      <div className={styles.inputContainer}>
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          className={styles.input}
                          placeholder="Enter current password"
                          value={formData.currentPassword}
                          onChange={(e) =>
                            handleInputChange("currentPassword", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <span className={styles.errorMessage}>
                          {errors.currentPassword}
                        </span>
                      )}
                    </div>

                    {/* New Password */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="newPassword">
                        New Password
                      </label>
                      <div className={styles.inputContainer}>
                        <input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          className={styles.input}
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={(e) =>
                            handleInputChange("newPassword", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {formData.newPassword && (
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

                      {errors.newPassword && (
                        <span className={styles.errorMessage}>
                          {errors.newPassword}
                        </span>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="confirmPassword">
                        Confirm New Password
                      </label>
                      <div className={styles.inputContainer}>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={styles.input}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span className={styles.errorMessage}>
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>

                    {/* Password Form Actions */}
                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={cancelPasswordEdit}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={
                          isLoading ||
                          !formData.currentPassword ||
                          !formData.newPassword ||
                          !formData.confirmPassword
                        }
                      >
                        {isLoading ? (
                          <div className={styles.spinner} />
                        ) : (
                          <Save size={16} />
                        )}
                        {isLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.passwordDisplay}>
                    <p className={styles.passwordInfo}>
                      Password was last updated on January 15, 2024
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Favorite Genres Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  Favorite Genres
                  {needsGenreSetup && (
                    <span className={styles.setupRequired}>Setup Required</span>
                  )}
                </h3>
                {!isEditingGenres && (
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditingGenres(true)}
                  >
                    <Edit3 size={16} />
                    {needsGenreSetup ? "Set Genres" : "Edit Genres"}
                  </button>
                )}
              </div>

              {needsGenreSetup && !isEditingGenres && (
                <div className={styles.setupPrompt}>
                  <Info className={styles.setupIcon} />
                  <div>
                    <p className={styles.setupTitle}>Complete your profile</p>
                    <p className={styles.setupDescription}>
                      Help us recommend games you'll love by selecting your
                      favorite genres.
                    </p>
                  </div>
                </div>
              )}

              {isEditingGenres ? (
                <div className={styles.genreEditForm}>
                  <div className={styles.genreSelector} ref={genreDropdownRef}>
                    <button
                      type="button"
                      className={`${styles.genreButton} ${
                        showGenreDropdown ? styles.open : ""
                      }`}
                      onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                    >
                      <span>
                        {formData.favoriteGenres.length === 0
                          ? "Select up to 3 genres"
                          : `${formData.favoriteGenres.length} genre${
                              formData.favoriteGenres.length > 1 ? "s" : ""
                            } selected`}
                      </span>
                      <ChevronDown className={styles.chevronIcon} />
                    </button>

                    {showGenreDropdown && (
                      <div className={styles.genreDropdown}>
                        {genres.map((genre) => {
                          const IconComponent = genre.icon;
                          const isSelected = formData.favoriteGenres.includes(
                            genre.id
                          );
                          const isDisabled =
                            !isSelected && formData.favoriteGenres.length >= 3;

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
                  {formData.favoriteGenres.length > 0 && (
                    <div className={styles.selectedGenres}>
                      {formData.favoriteGenres.map((genreId) => {
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

                  {/* Genre Form Actions */}
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={cancelGenreEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleGenreUpdate}
                      disabled={
                        isLoading || formData.favoriteGenres.length === 0
                      }
                    >
                      {isLoading ? (
                        <div className={styles.spinner} />
                      ) : (
                        <Save size={16} />
                      )}
                      {isLoading ? "Saving..." : "Save Genres"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.genreDisplay}>
                  {userData.favoriteGenres.length > 0 ? (
                    <div className={styles.currentGenres}>
                      {userData.favoriteGenres.map((genreId) => {
                        const genre = genres.find((g) => g.id === genreId);
                        const IconComponent = genre.icon;
                        return (
                          <div key={genreId} className={styles.currentGenreTag}>
                            <IconComponent className={styles.currentTagIcon} />
                            <span>{genre.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.noGenres}>
                      No favorite genres selected
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Gaming Stats */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Gaming Stats</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {userData.stats.gamesOwned}
                  </div>
                  <div className={styles.statLabel}>Games Owned</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {userData.stats.hoursPlayed.toLocaleString()}
                  </div>
                  <div className={styles.statLabel}>Hours Played</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {userData.stats.achievementsUnlocked}
                  </div>
                  <div className={styles.statLabel}>Achievements</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Visual */}
      <div className={styles.rightSection}>
        <div className={styles.visualContent}>
          <div className={styles.profileVisual}>
            <h3 className={styles.visualTitle}>Your Gaming Journey</h3>
            <p className={styles.visualSubtitle}>
              Customize your profile to get better game recommendations
            </p>

            {/* Achievement Showcase */}
            <div className={styles.achievementShowcase}>
              <div className={styles.achievement}>
                <div className={styles.achievementIcon}>🏆</div>
                <div className={styles.achievementText}>
                  <div className={styles.achievementTitle}>Profile Master</div>
                  <div className={styles.achievementDesc}>
                    Complete your profile setup
                  </div>
                </div>
              </div>
              <div className={styles.achievement}>
                <div className={styles.achievementIcon}>🎮</div>
                <div className={styles.achievementText}>
                  <div className={styles.achievementTitle}>Game Explorer</div>
                  <div className={styles.achievementDesc}>
                    Discover games across multiple genres
                  </div>
                </div>
              </div>
              <div className={styles.achievement}>
                <div className={styles.achievementIcon}>🔒</div>
                <div className={styles.achievementText}>
                  <div className={styles.achievementTitle}>Security Pro</div>
                  <div className={styles.achievementDesc}>
                    Keep your account secure
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
