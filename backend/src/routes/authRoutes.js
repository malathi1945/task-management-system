const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
  register,
  login,
  getUsers,
  deleteUser,
  updateUser
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

router.get('/users', authMiddleware, roleMiddleware('admin'), getUsers);
router.put('/users/:id', authMiddleware, roleMiddleware('admin'), updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

module.exports = router;