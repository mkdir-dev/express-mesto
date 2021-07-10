const User = require('../models/user');
const {
  SUCCESS_OK,
  ERROR_CODE,
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
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(SUCCESS_OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
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