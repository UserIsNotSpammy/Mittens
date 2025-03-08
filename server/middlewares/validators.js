import { body, param, validationResult } from "express-validator";
import { handleError, throwError } from "../utils/helperFunctions.js";
import Users from "../db/usersSchema.js";
const validatePost = async (req, res, next) => {
  try {
    // Run all validations and sanitizations
    // await body("attachments")
    //   .optional({ nullable: true })
    //   .isString()
    //   .withMessage("Attachment name must be a string")
    //   .trim()
    //   .escape()
    //   .run(req);
    await body("postText")
      .optional({ nullable: true })
      .isString()
      .withMessage("Post caption must be a string")
      .trim()
      .escape()
      .run(req);

    await body("poll")
      .optional({ nullable: true })
      .isArray()
      .customSanitizer((poll) => {
        if (!Array.isArray(poll) || poll.length < 2) {
          throw new Error("Poll must have at least 2 options");
        }
        return poll;
      })
      .run(req);

    await body("poll.*").trim().escape().run(req);

    await body("event")
      .optional({ nullable: true })
      .isObject()
      .withMessage("Event must be an object")
      .run(req);
    if (req.body.event) {
      await body("event.location")
        .isObject()
        .withMessage("Location must be an object")
        .run(req);

      await body("event.location.name")
        .isString()
        .withMessage("Location name must be a string")
        .trim()
        .escape()
        .run(req);

      await body("event.date")
        .isISO8601()
        .trim()
        .escape()
        .withMessage("Event date must be a valid ISO 8601 date format")
        .run(req);

      await body("event.time")
        .matches(/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/)
        .trim()
        .escape()
        .withMessage("Event time must be in HH:mm format (24-hour)")
        .run(req);

      await body("event.name")
        .isString()
        .trim()
        .escape()
        .withMessage("Event time must be in HH:mm format (24-hour)")
        .run(req);

      await body("event.location.lat")
        .isFloat()
        .trim()
        .escape()
        .withMessage("Latitude must be a number")
        .run(req);

      await body("event.location.lng")
        .isFloat()
        .withMessage("Longitude must be a number")
        .run(req);

      await body("event.location.link")
        .isURL()
        .withMessage("Link must be a valid URL")
        .trim()
        .escape()
        .run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty())
      throwError("Post validation failed", 400, errors.array());

    next();
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Unknown error occurred",
      details: err.details || [],
    });
  }
};

const validateRemeow = async (req, res, next) => {
  try {
    await param("id")
      .notEmpty()
      .withMessage("Post id can't be empty")
      .isString()
      .escape()
      .trim()
      .run(req);
    await body("text")
      .optional({ nullable: true })
      .isString()
      .escape()
      .trim()
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty())
      throwError("Post validation failed", 400, errors.array());
    next();
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Unknown error occurred",
      details: err.details || [],
    });
  }
};
const validateRegFormData = async (req, res, next) => {
  try {
    await Promise.all([
      body("firstName")
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[a-zA-Z]+$/)
        .withMessage("Only letters allowed")
        .notEmpty()
        .withMessage("First name is required")
        .run(req),
      body("lastName")
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[a-zA-Z]+$/)
        .withMessage("Only letters allowed")
        .notEmpty()
        .withMessage("Last name is required")
        .run(req),
      body("birthDate")
        .notEmpty()
        .withMessage("Date of birth is required")
        .custom((value) => {
          if (!Date.parse(value)) {
            throw new Error("Invalid date");
          }
          return true;
        })
        .run(req),

      body("gender")
        .trim()
        .isIn(["male", "female"])
        .withMessage("Invalid gender")
        .notEmpty()
        .withMessage("Gender is required")
        .run(req),
      body("country")
        .trim()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Only letters allowed")
        .notEmpty()
        .withMessage("Country is required")
        .run(req),
      body("userTag")
        .trim()
        .matches(/^@[\S]+$/)
        .withMessage('Must start with "@" and contain no spaces')
        .isLength({ min: 4, max: 20 })
        .withMessage("User Tag must be between 4 and 20 characters")
        .notEmpty()
        .withMessage("User Tag is required")
        .custom(async (value) => {
          const user = await Users.exists({ userTag: value });
          if (user) throwError("This user tag is unavailable", 409);
        })
        .run(req),
      body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email")
        .notEmpty()
        .withMessage("Email is required")
        .run(req),
      body("number")
        .trim()
        .matches(/^\d+$/)
        .withMessage("Must be a valid phone number")
        .notEmpty()
        .withMessage("Phone number is required")
        .run(req),
      body("password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Min 8 characters")
        .notEmpty()
        .withMessage("Password is required")
        .run(req),
      body("confirmPassword")
        .trim()
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords must match")
        .notEmpty()
        .withMessage("Confirm password is required")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errDetails = errors.array();
      console.log(req.body); // Log the full request body
      console.log("Received birthDay:", req.body.birthDay);
      throwError("An Error occurred", 400, errDetails);
    }

    next();
  } catch (error) {
    handleError(res, error);
  }
};

export { validatePost, validateRemeow, validateRegFormData };
