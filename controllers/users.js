const bcrypt = require('bcryptjs');
const User = require('../models/user');
const {
  SUCCESS_OK,
  ERROR_CODE,
  ERROR_AUTH,
  NOT_FOUND,
  ERROR_SERVER,
} = require('../utils/status');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(SUCCESS_OK).send({ data: users }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(SUCCESS_OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные пользователя',
        });
      }
      if (err.message === 'NotFound') {
        return res.status(NOT_FOUND).send({
          message: 'Запрашиваемый пользователь не найден',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => res.status(SUCCESS_OK).send({ data: user }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(ERROR_CODE).send({
            message: 'Ошибка валидации при создании пользователя',
          });
        } else if (err.name === 'CastError') {
          res.status(ERROR_CODE).send({
            message: 'Переданы некорректные данные при создании пользователя',
          });
        }
        return res.status(ERROR_SERVER).send({
          message: 'Ошибка сервера. Ошибка по-умолчанию',
        });
      }));
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotFound'))
    .then((user) => res.status(SUCCESS_OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при обновлении данных о пользователе',
        });
      }
      if (err.message === 'NotFound') {
        return res.status(NOT_FOUND).send({
          message: 'Запрашиваемый пользователь не найден',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotFound'))
    .then((user) => res.status(SUCCESS_OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при обновлении аватара',
        });
      }
      if (err.message === 'NotFound') {
        return res.status(NOT_FOUND).send({
          message: 'Запрашиваемый пользователь не найден',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        Promise.reject(new Error('Неправильные почта или пароль'));
      }
      res.send({ message: 'Всё верно!' });
    })
    .catch(() => {
      res.status(ERROR_AUTH).send({
        message: 'Ошибка аутентификации',
      });
    });
};