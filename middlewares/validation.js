const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

module.exports.signinValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

module.exports.signupValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value, url) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return url;
      }
      return value.message('Неверный URL-адрес');
    }),
  }),
});

module.exports.userIdValidation = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
});

module.exports.userInfoValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

module.exports.userAvatarValidation = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((value, url) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return url;
      }
      return value.message('Неверный URL-адрес');
    }),
  }),
});

module.exports.cardIdValidation = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
});

module.exports.cardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom((value, url) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return url;
      }
      return value.message('Неверный URL-адрес');
    }),
  }),
});