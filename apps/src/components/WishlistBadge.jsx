// src/components/WishlistBadge.jsx
import { Heart } from "lucide-react";

const WishlistBadge = ({ count, iconClass, showText = true }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ position: "relative" }}>
        <Heart className={iconClass} />
        {count > 0 && (
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
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>
      {showText && <span>Wishlist</span>}
    </div>
  );
};

export default WishlistBadge;
