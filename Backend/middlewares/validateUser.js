import Joi from "joi";

const validateUser = (type) => {
  return (req, res, next) => {
    let schema;

    if (type === "register") {
      // 🎯 Validation for Signup (Register)
      schema = Joi.object({
        username: Joi.string()
          .pattern(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/)
          .required()
          .messages({
            "string.pattern.base":
              "Username must start with a letter and contain only letters, numbers, and underscores.",
            "string.empty": "Username is required.",
          }),
        email: Joi.string()
          .pattern(/^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
          .email()
          .required()
          .messages({
            "string.pattern.base":
              "Email must start with at least 3 characters before '@'.",
            "string.email": "Invalid email format.",
          }),
        password: Joi.string().min(6).required().messages({
          "string.min": "Password must be at least 6 characters long.",
        }),
        // gender: Joi.string().valid("male", "female").optional(),
      });
    } else if (type === "login") {
      // 🎯 Validation for Login
      schema = Joi.object({
        email: Joi.string().email().required().messages({
          "string.email": "Invalid email format.",
        }),
        password: Joi.string()
          .min(6) // At least 6 characters
          .required()
          .messages({
            "string.min": "Password must be at least 6 characters long.",
          }),
      });
    }

    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    next();
  };
};

export default validateUser;
