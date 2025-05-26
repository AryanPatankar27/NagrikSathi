const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['user', 'admin'])
], registerUser);

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists(),
  body('role').isIn(['user', 'admin'])
], loginUser);

module.exports = router; 