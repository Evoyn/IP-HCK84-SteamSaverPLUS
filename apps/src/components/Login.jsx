"use client";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Gamepad2,
  Shield,
  Zap,
  Trophy,
  Users,
  Star,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import styles from "./login.module.css";

// Gaming artworks for slideshow
const gamingArtworks = [
  {
    id: 1,
    title: "Welcome Back, Gamer",
    subtitle: "Your adventure continues here",
  },
  {
    id: 2,
    title: "Resume Your Quest",
    subtitle: "Pick up where you left off",
  },
  {
    id: 3,
    title: "Your Games Await",
    subtitle: "Jump back into the action",
  },
  {
    id: 4,
    title: "Connect & Play",
    subtitle: "Friends are waiting online",
  },
  {
    id: 5,
    title: "New Achievements",
    subtitle: "Unlock exclusive rewards",
  },
];

const LoginPage = () => {
  let navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Validation state
  const [emailValid, setEmailValid] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const formRef = useRef(null);

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

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    // Real-time validation for email
    if (field === "email") {
      setEmailValid(value ? validateEmail(value) : null);
    }
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
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        } else if (response.status === 400) {
          throw new Error(data.message || "Invalid login data");
        } else {
          throw new Error(data.message || "Login failed. Please try again.");
        }
      }

      // Store the access token
      if (data.access_token) {
        localStorage.setItem("authToken", data.access_token);

        // Store email if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
      }

      setLoginSuccess(true);

      // Show success message briefly, then redirect
      setTimeout(() => {
        navigate("/"); // or wherever you want to redirect after login
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
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

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
      setEmailValid(validateEmail(rememberedEmail));
    }
  }, []);

  async function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);

    try {
      const { data } = await axios.post("http://localhost:3000/login/google", {
        googleToken: response.credential,
      });

      localStorage.setItem("authToken", data.access_token);
      setLoginSuccess(true);
      setTimeout(() => {
        navigate("/"); // or wherever you want to redirect after login
      }, 2000);
    } catch (error) {
      console.error("Google login error:", error);
      setApiError(
        error.response?.data?.message ||
          "Google login failed. Please try again."
      );

      // Shake animation on error
      formRef.current?.classList.add(styles.shake);
      setTimeout(() => {
        formRef.current?.classList.remove(styles.shake);
      }, 500);
    }
  }

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  }, []);

  // Handle custom Google button click
  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className={styles.loginPage}>
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
            style={{ top: "15%", right: "8%" }}
          >
            <span>🎮 Quick Login</span>
          </div>
          <div
            className={styles.floatingBadge}
            style={{ bottom: "25%", left: "12%" }}
          >
            <span>🔒 Secure & Fast</span>
          </div>
          <div
            className={styles.floatingBadge}
            style={{ top: "55%", right: "10%" }}
          >
            <span>⚡ Instant Access</span>
          </div>
        </div>

        {/* Gaming Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <Trophy className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>2.5K+</span>
              <span className={styles.statLabel}>Achievements</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Users className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>10M+</span>
              <span className={styles.statLabel}>Active Players</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Star className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>4.9/5</span>
              <span className={styles.statLabel}>User Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Login Form */}
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

          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Sign in to continue your gaming journey
          </p>
        </div>

        {/* Success Message */}
        {loginSuccess && (
          <div className={styles.successMessage}>
            <Shield className={styles.successIcon} />
            <p>Login successful! Redirecting...</p>
          </div>
        )}

        {/* API Error Message */}
        {apiError && (
          <div className={styles.apiError}>
            <AlertCircle className={styles.errorIcon} />
            <p>{apiError}</p>
          </div>
        )}

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              Email Address
            </label>
            <div className={styles.inputContainer}>
              <Mail className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className={`${styles.input} ${styles.withIcon} ${
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
                autoFocus
              />
            </div>
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.fieldGroup}>
            <div className={styles.passwordHeader}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <a href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </a>
            </div>
            <div className={styles.inputContainer}>
              <Lock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.withIcon}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.rememberMe}
                onChange={(e) =>
                  handleInputChange("rememberMe", e.target.checked)
                }
              />
              <span className={styles.checkboxCustom}>
                {formData.rememberMe && <Zap size={14} />}
              </span>
              <span className={styles.checkboxText}>Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`${styles.submitButton} ${
              !formData.email || !formData.password ? styles.disabled : ""
            }`}
            disabled={!formData.email || !formData.password || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className={styles.buttonSpinner} />
                Signing In...
              </>
            ) : (
              <>
                <Shield className={styles.buttonIcon} />
                Sign In
              </>
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
                aria-label="G"
                onClick={handleGoogleLogin}
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
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className={styles.signUpLink}>
            New to SteamSaver+?{" "}
            <a href="/register" className={styles.link}>
              Create an account
            </a>
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

export default LoginPage;
