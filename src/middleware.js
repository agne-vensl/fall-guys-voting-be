const Joi = require("joi");
const jwt = require("jsonwebtoken");

const { jwtSecret } = require("./config");

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .trim()
    .lowercase()
    .required(),
  password: Joi.string().min(8).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).trim().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .trim()
    .lowercase()
    .required(),
  password: Joi.string().min(8).required(),
});

module.exports = {
  async isRegisterDataCorrect(req, res, next) {
    let userData;

    try {
      userData = await registerSchema.validateAsync({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      req.userData = userData;
      return next();
    } catch (e) {
      return res.status(400).send({ error: "Incorrect data" });
    }
  },
  async isLoginDataCorrect(req, res, next) {
    let userData;

    try {
      userData = await loginSchema.validateAsync({
        email: req.body.email,
        password: req.body.password,
      });

      req.userData = userData;
      return next();
    } catch (e) {
      return res.status(400).send({ error: "Incorrect data" });
    }
  },
  loggedIn(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const decodedToken = jwt.verify(token, jwtSecret);
      req.userData = decodedToken;
      next();
    } catch (err) {
      console.log(err);
      return res.status(401).send({ error: "Validation failed" });
    }
  },
};
