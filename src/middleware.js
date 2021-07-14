const Joi = require("joi");

const loginShema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(8).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
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
};
