const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

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

app.get('*', (req, res) => {
  res.status(NOT_FOUND).send({
    message: 'Запрашиваемый ресурс не найден',
  });
});

app.use(helmet());

app.use((req, res, next) => {
  req.user = {
    _id: '60e2dc0816ab1cc273caf797',
  };

  next();
});

app.use('/', express.json());
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.listen(PORT);