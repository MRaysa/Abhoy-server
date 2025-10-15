const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// User routes
router.route('/')
  .get(getAllUsers)      // GET /api/users
  .post(createUser);     // POST /api/users

router.route('/:id')
  .get(getUserById)      // GET /api/users/:id
  .put(updateUser)       // PUT /api/users/:id
  .delete(deleteUser);   // DELETE /api/users/:id

module.exports = router;
