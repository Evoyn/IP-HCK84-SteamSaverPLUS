"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import styles from "./Footer.module.css";

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerLinks = [
    { text: "Terms of Service", href: "/terms" },
    { text: "Privacy Policy", href: "/privacy" },
    { text: "Safety & Security", href: "/safety" },
    { text: "Refund Policy", href: "/refund" },
    { text: "API Documentation", href: "/api-docs" },
    { text: "Contact Us", href: "/contact" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section - Copyright and Description */}
        <div className={styles.topSection}>
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>
              © 2025, SteamSaver+. All rights reserved.
            </p>
            <p className={styles.description}>
              SteamSaver+ is a modern React-based web application that allows
              users to effortlessly browse the latest discounted games on Steam
              and get personalized recommendations using Google Gemini AI API.
              Combines live deal tracking from a public Steam-related API with
              intelligent assistance to help users discover games based on mood,
              genre, or preferences.
            </p>
          </div>
        </div>

        {/* Bottom Section - Links and Back to Top */}
        <div className={styles.bottomSection}>
          <nav className={styles.footerLinks}>
            {footerLinks.map((link, index) => (
              <a key={index} href={link.href} className={styles.footerLink}>
                {link.text}
              </a>
            ))}
          </nav>

          <button
            className={`${styles.backToTopButton} ${
              showBackToTop ? styles.visible : ""
            }`}
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <ChevronUp className={styles.backToTopIcon} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
