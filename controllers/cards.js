const Card = require('../models/card');
const {
  SUCCESS_OK,
  ERROR_CODE,
  ERROR_FORBIDDEN,
  NOT_FOUND,
  ERROR_SERVER,
} = require('../utils/status');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(SUCCESS_OK).send({ data: cards }))
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

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({
    name,
    link,
    owner: req.user._id,
  })
    .then((card) => res.status(SUCCESS_OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE).send({
          message: 'Ошибка валидации при создании карточки',
        });
      } else if (err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при создании карточки',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  const { userId } = req.user;

  Card.findById(cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (card.owner._id.toString() === userId) {
        Card.findByIdAndRemove(cardId)
          .then(() => res.status(SUCCESS_OK).send({
            message: 'Удаление карточки прошло успешно',
          }));
      } else {
        res.status(ERROR_FORBIDDEN).send({
          message: 'Вы не можете удалять чужие карточки',
        });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при удалении карточки',
        });
      }
      if (err.message === 'NotFound') {
        return res.status(NOT_FOUND).send({
          message: 'Запрашиваемая карточка пользователя не найдена',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then((card) => res.status(SUCCESS_OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные отметки "Мне нравится"',
        });
      }
      if (err.message === 'NotFound') {
        return res.status(NOT_FOUND).send({
          message: 'Запрашиваемая карточка пользователя не найдена',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then((card) => res.status(SUCCESS_OK).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные отметки "Мне нравится"',
        });
      }
      if (err.message === 'NotFound') {
        return res.status(NOT_FOUND).send({
          message: 'Запрашиваемая карточка пользователя не найдена',
        });
      }
      return res.status(ERROR_SERVER).send({
        message: 'Ошибка сервера. Ошибка по-умолчанию',
      });
    });
};