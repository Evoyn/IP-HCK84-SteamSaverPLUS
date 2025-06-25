function errorHandler(err, req, res, next) {
  //   console.log(err.name, "<<<");
  console.log(err);

  switch (err.name) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      res.status(400).json({ message: err.errors[0].message });
      break;
    case "ValidationError":
      res.status(400).json({ message: err.message });
      break;
    case "Unauthorized":
      res.status(401).json({ message: err.message });
      break;
    case "JsonWebTokenError":
      res.status(401).json({ message: "Invalid token" });
      break;
    case "GameNotFound":
    case "NotInWishlist":
    case "NotFound":
      code = 404;
      message = err.message || "Resource not found";
      res.status(404).json({ message });
      break;
    case "AlreadyWishlisted":
    case "BadRequest":
      code = 400;
      message = err.message || "Bad Request";
      res.status(400).json({ message });
      break;
    default:
      res.status(500).json({ message: "Internal server error" });
      break;
  }
}

module.exports = errorHandler;
