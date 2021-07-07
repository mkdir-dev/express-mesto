const router = require('express').Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUser);
router.post('/', createUser);
router.patch('/me', updateUser);

module.exports = router;