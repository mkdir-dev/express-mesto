require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { login, createUser } = require('./controllers/users');

const {
  signinValidation,
  signupValidation,
} = require('./middlewares/validation');

const auth = require('./middlewares/auth');
const usersRoutes = require('./routes/users');
const cardsRoutes = require('./routes/cards');

const NotFoundError = require('./errors/NotFoundError');
// eslint-disable-next-line import/order
const { errors } = require('celebrate');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(limiter);

app.use('/', express.json());
app.use(helmet());
app.use(cookieParser());

app.post('/signin', signinValidation, login);
app.post('/signup', signupValidation, createUser);

app.use('/users', auth, usersRoutes);
app.use('/cards', auth, cardsRoutes);

app.use(errors());

app.get('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.listen(PORT);