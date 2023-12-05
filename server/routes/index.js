const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const articleController = require('../controllers/articleController.js');

router.get('/', articleController.getArticles);

// Login routes
router.get('/login', userController.login);
router.post('/login', userController.loginHandler);

// Register routes
router.get('/register', userController.register);
router.post('/register', userController.registerHandler);

// Logout route
router.get('/logout', userController.logout);

// Account route
router.get('/account', userController.account);

// Account actions
router.get('/update', userController.update);
router.post('/update', userController.updateHandler);
router.post('/user/delete', userController.deleteUser);

module.exports = router;