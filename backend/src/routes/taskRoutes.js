const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.use(authMiddleware);

// Create Task
router.post('/', createTask);

// Get All Tasks
router.get('/', getTasks);

// Get Single Task
router.get('/:id', getSingleTask);

// Update Task
router.put('/:id', updateTask);

// Delete Task
router.delete('/:id', deleteTask);

module.exports = router;