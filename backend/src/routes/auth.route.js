const express = require('express');
const authController = require('../controllers/auth.controller');
const validators = require('../middlewares/validator.middleware');
const router = express.Router();




router.post('/register',validators.registerUserValidator,authController.registerUser);
router.post('/login',validators.loginUserValidator,authController.loginUser);
router.get('/logout',authController.logoutUser);

module.exports = router;
