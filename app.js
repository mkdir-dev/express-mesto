const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const usersRoutes = require('./routes/users');
const cardsRoutes = require('./routes/cards');

const {
  NOT_FOUND,
} = require('./utils/status');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use('/', express.json());
app.use(helmet());
app.use(cookieParser());

app.post('/signin', login);
app.post('/signup', createUser);

app.use('/users', auth, usersRoutes);
app.use('/cards', auth, cardsRoutes);

app.get('*', (req, res) => {
  res.status(NOT_FOUND).send({
    message: 'Запрашиваемый ресурс не найден',
  });
});

app.listen(PORT);