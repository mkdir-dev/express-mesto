const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const InternalServerError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');

const User = require('../models/user');

const {
  SUCCESS_OK,
} = require('../errors/errorStatuses');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(SUCCESS_OK).send({ data: users }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
      throw new InternalServerError('Ошибка сервера. Ошибка по-умолчанию');
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(SUCCESS_OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные пользователя');
      }
      if (err.message === 'NotFound') {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      throw new InternalServerError('Ошибка сервера. Ошибка по-умолчанию');
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
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
          throw new BadRequestError('Ошибка валидации при создании пользователя');
        } else if (err.name === 'CastError') {
          throw new BadRequestError('Переданы некорректные данные при создании пользователя');
        }
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new ConflictError('Пользователь с таким Email уже зарегистрирован'); // !!!
        }
        throw new InternalServerError('Ошибка сервера. Ошибка по-умолчанию');
      }))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
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
        throw new BadRequestError('Переданы некорректные данные при обновлении данных о пользователе');
      }
      if (err.message === 'NotFound') {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      throw new InternalServerError('Ошибка сервера. Ошибка по-умолчанию');
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
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
        throw new BadRequestError('Переданы некорректные данные при обновлении аватара');
      }
      if (err.message === 'NotFound') {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      throw new InternalServerError('Ошибка сервера. Ошибка по-умолчанию');
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      }).send({ message: 'Aутентификация прошла успешнo!' });
    })
    .catch(() => {
      throw new UnauthorizedError('Ошибка аутентификации');
    })
    .catch(next);
};

module.exports.getCurrentUserInfo = (req, res, next) => {
  User.findById(res.user._id)
    .then((userInfo) => {
      res.status(SUCCESS_OK).send({ userInfo });
    })
    .catch(next);
};