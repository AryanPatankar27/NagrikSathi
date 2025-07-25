const express = require('express');
const { signup, login, getMe, protect } = require('../controllers/authController'); 

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;