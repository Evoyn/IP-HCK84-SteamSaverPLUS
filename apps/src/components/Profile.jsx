"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Check,
  X,
  Info,
  ChevronDown,
  Gamepad2,
  User,
  Mail,
  Save,
  Edit3,
} from "lucide-react";
import styles from "./profile.module.css";

const ProfilePage = () => {
  // Form state
  const [userData, setUserData] = useState({
    id: null,
    username: "",
    email: "",
    createdAt: "",
    genres: [], // Changed from Genres to genres to match API
  });

  const [formData, setFormData] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    selectedGenreIds: [],
  });

  const [availableGenres, setAvailableGenres] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
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

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        setErrors({ general: "No authentication token found" });
        setIsFetchingUser(false);
        return;
      }

      let userId;
      try {
        const decoded = jwtDecode(authToken);
        userId = decoded.id || decoded.userId;
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        setErrors({ general: "Invalid authentication token" });
        setIsFetchingUser(false);
        return;
      }

      const response = await axios.get(
        `https://goat.nebux.site/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const user = response.data;

      setUserData({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        genres: user.genres || [], // Changed to lowercase to match API
      });

      setFormData((prev) => ({
        ...prev,
        username: user.username,
        selectedGenreIds: user.genres ? user.genres.map((g) => g.id) : [],
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);

      if (error.response?.status === 401) {
        setErrors({ general: "Session expired. Please login again." });
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (error.response?.status === 404) {
        setErrors({ general: "User not found" });
      } else {
        setErrors({ general: "Failed to load user data. Please try again." });
      }
    } finally {
      setIsFetchingUser(false);
    }
  };

  // Fetch genres
  const fetchGenres = async () => {
    try {
      const response = await axios.get("https://goat.nebux.site/games/genre");
      setAvailableGenres(response.data);
    } catch (error) {
      console.error("Error fetching genres:", error);
      setErrors({ genres: "Failed to load genres" });
    }
  };

  // Initialize data
  useEffect(() => {
    fetchUserData();
    fetchGenres();
  }, []);

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
      const currentGenres = prev.selectedGenreIds;
      if (currentGenres.includes(genreId)) {
        return {
          ...prev,
          selectedGenreIds: currentGenres.filter((id) => id !== genreId),
        };
      } else if (currentGenres.length < 3) {
        return { ...prev, selectedGenreIds: [...currentGenres, genreId] };
      }
      return prev;
    });
  };

  // Update user profile
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        setErrors({ general: "No authentication token found" });
        return;
      }

      const updateData = {
        username: formData.username,
        genres: formData.selectedGenreIds,
      };

      const response = await axios.put(
        `https://goat.nebux.site/users/${userData.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Fetch updated user data to ensure we have the latest info
      await fetchUserData();

      setSuccessMessage("Profile updated successfully!");
      setIsEditingGenres(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        setErrors({ general: "Session expired. Please login again." });
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Failed to update profile. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const cancelGenreEdit = () => {
    setFormData((prev) => ({
      ...prev,
      selectedGenreIds: userData.genres.map((g) => g.id),
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    const usernameChanged = formData.username !== userData.username;
    const genresChanged =
      JSON.stringify(formData.selectedGenreIds.sort()) !==
      JSON.stringify(userData.genres.map((g) => g.id).sort());
    return usernameChanged || genresChanged;
  };

  if (isFetchingUser) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.backgroundMesh} />
        <div className={styles.mainSection}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      {/* Animated Background Mesh */}
      <div className={styles.backgroundMesh} />

      {/* Centered Form Container */}
      <div className={styles.mainSection}>
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

          {/* Error Message */}
          {errors.general && (
            <div className={styles.errorBanner}>
              <X className={styles.errorIcon} />
              {errors.general}
            </div>
          )}

          {/* Profile Form */}
          <div className={styles.form}>
            {/* Profile Picture Section */}
            <div className={styles.profilePictureSection}>
              <div className={styles.avatarContainer}>
                <div className={styles.defaultAvatar}>
                  <User size={32} />
                </div>
              </div>
              <div className={styles.userInfo}>
                <h3 className={styles.displayName}>{userData.username}</h3>
                <p className={styles.joinDate}>
                  Member since {formatDate(userData.createdAt)}
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Account Information</h3>

              {/* Username (Always Editable) */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <User className={styles.labelIcon} />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className={styles.input}
                  placeholder="Enter username"
                />
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
                  <span className={styles.readOnlyBadge}>Read-only</span>
                </div>
              </div>
            </div>

            {/* Favorite Genres Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  Favorite Genres
                  {userData.genres.length === 0 && (
                    <span className={styles.setupRequired}>Setup Required</span>
                  )}
                </h3>
                {!isEditingGenres && (
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditingGenres(true)}
                  >
                    <Edit3 size={16} />
                    {userData.genres.length === 0
                      ? "Set Genres"
                      : "Edit Genres"}
                  </button>
                )}
              </div>

              {userData.genres.length === 0 && !isEditingGenres && (
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
                        {formData.selectedGenreIds.length === 0
                          ? "Select up to 3 genres"
                          : `${formData.selectedGenreIds.length} genre${
                              formData.selectedGenreIds.length > 1 ? "s" : ""
                            } selected`}
                      </span>
                      <ChevronDown className={styles.chevronIcon} />
                    </button>

                    {showGenreDropdown && (
                      <div className={styles.genreDropdown}>
                        {availableGenres.map((genre) => {
                          const isSelected = formData.selectedGenreIds.includes(
                            genre.id
                          );
                          const isDisabled =
                            !isSelected &&
                            formData.selectedGenreIds.length >= 3;

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
                                <span className={styles.genreName}>
                                  {genre.name}
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
                  {formData.selectedGenreIds.length > 0 && (
                    <div className={styles.selectedGenres}>
                      {formData.selectedGenreIds.map((genreId) => {
                        const genre = availableGenres.find(
                          (g) => g.id === genreId
                        );
                        return genre ? (
                          <div key={genreId} className={styles.genreTag}>
                            <span>{genre.name}</span>
                            <button
                              type="button"
                              className={styles.removeTag}
                              onClick={() => handleGenreToggle(genreId)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : null;
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
                  </div>
                </div>
              ) : (
                <div className={styles.genreDisplay}>
                  {userData.genres && userData.genres.length > 0 ? (
                    <div className={styles.currentGenres}>
                      {userData.genres.map((genre) => (
                        <div key={genre.id} className={styles.currentGenreTag}>
                          <span>{genre.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noGenres}>
                      No favorite genres selected
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Update Button */}
            {hasUnsavedChanges() && (
              <div className={styles.updateSection}>
                <button
                  type="button"
                  className={styles.updateButton}
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className={styles.spinner} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
