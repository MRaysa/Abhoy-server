const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { userValidationSchemas, validate } = require('../middleware/validation');

// User routes
router.route('/')
  .get(getAllUsers)      // GET /api/users
  .post(validate(userValidationSchemas.createUser), createUser);     // POST /api/users

router.route('/:id')
  .get(getUserById)      // GET /api/users/:id
  .put(validate(userValidationSchemas.updateUser), updateUser)       // PUT /api/users/:id
  .delete(deleteUser);   // DELETE /api/users/:id

module.exports = router;
