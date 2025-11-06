const { body, validationResult } = require("express-validator");

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

const registerUserValidator = [
  body("username")
    .isString()
    .withMessage("Username must be a String")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("fullName.firstName")
    .isString()
    .withMessage("First name must be a String")
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("fullName.lastName")
    .isString()
    .withMessage("Last name must be a String")
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  respondWithValidationErrors,
];
const loginUserValidator = [
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a String"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 character long")
    .notEmpty()
    .withMessage("Password is required"),
  (req, res, next) => {
    const { email, username } = req.body || {};
    if (!email && !username) {
      return res
        .status(400)
        .json({ message: "Either email or username is required" });
    }
    return next();
  },
  respondWithValidationErrors,
];

const createEventValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title is required"),
  body("startTime")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date"),
  body("endTime")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date"),
  body("status")
    .optional()
    .isIn(["BUSY", "SWAPPABLE", "SWAP_PENDING"])
    .withMessage("Status must be one of: BUSY, SWAPPABLE, SWAP_PENDING"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  (req, res, next) => {
    const { startTime, endTime } = req.body;
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }
    return next();
  },
  respondWithValidationErrors,
];

const createSwapRequestValidator = [
  body("mySlotId")
    .isMongoId()
    .withMessage("mySlotId must be a valid MongoDB ObjectId"),
  body("theirSlotId")
    .isMongoId()
    .withMessage("theirSlotId must be a valid MongoDB ObjectId"),
  body("message").optional().isString().withMessage("Message must be a string"),
  (req, res, next) => {
    const { mySlotId, theirSlotId } = req.body;
    if (mySlotId === theirSlotId) {
      return res.status(400).json({
        success: false,
        message: "Cannot swap a slot with itself",
      });
    }
    return next();
  },
  respondWithValidationErrors,
];

const swapResponseValidator = [
  body("accept")
    .isBoolean()
    .withMessage("Accept field must be a boolean (true or false)"),
  respondWithValidationErrors,
];

module.exports = {
  registerUserValidator,
  loginUserValidator,
  createEventValidator,
  createSwapRequestValidator,
  swapResponseValidator,
};
