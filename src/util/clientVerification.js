const joi = require("joi");

const clientRegisterValidation = (data) => {
  const schemaValidation = joi.object({
    username: joi.string().required().min(4).max(26).messages({
      "string.empty": "Enter a valid username",
      "string.min": "Enter a valid username min 4 characters",
      "string.max": "Enter a valid username max 26 characters",
    }),
    firstName: joi.string().required().min(4).max(26).messages({
      "string.empty": "Enter a valid first name",
      "string.min": "Enter a valid first name min 4 characters",
      "string.max": "Enter a valid first name max 26 characters",
    }),
    lastName: joi.string().required().min(4).max(26).messages({
      "string.empty": "Enter a valid last name",
      "string.min": "Enter a valid last name min 4 characters",
      "string.max": "Enter a valid last name max 26 characters",
    }),
    email: joi.string().required().email().messages({
      "string.empty": "Enter a valid email",
      "string.email": "Enter a valid email",
    }),
    phone: joi.number().required().messages({
      "string.empty": "Enter a valid phone number",
    }),
    password: joi.string().required().min(8).max(26).messages({
      "string.empty": "Enter a valid password",
      "string.min": "Enter a valid password min 8 characters",
      "string.max": "Enter a valid password max 26 characters",
    }),
    confirmPassword: joi
      .string()
      .required()
      .valid(joi.ref("password"))
      .messages({
        "string.empty": "Enter a valid confirm password",
        "any.only": "Confirm password must be same as password",
      }),
  });
  return schemaValidation.validate(data);
};

const LoginValidation = (data) => {
  const schemaValidation = joi.object({
    email: joi.string().required().email().messages({
      "string.empty": "Enter a valid email",
      "string.email": "Enter a valid email",
    }),
    password: joi.string().required().min(8).max(26).messages({
      "string.empty": "Enter a valid password",
      "string.min": "Enter a valid password min 8 characters",
      "string.max": "Enter a valid password max 26 characters",
    }),
  });
  return schemaValidation.validate(data);
};
module.exports.clientRegisterValidation = clientRegisterValidation;
module.exports.LoginValidation = LoginValidation;
