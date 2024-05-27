const express = require('express');
const { register, login, updatePassword, getUserDetails } = require('../controllers/authController');

const router = express.Router();

// Route for user
router.post('/register', register);
router.post('/login', login);
router.post('/update-password', updatePassword);
router.get('/user', getUserDetails);

module.exports = router;
