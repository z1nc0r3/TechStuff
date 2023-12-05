const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const articleController = require('../controllers/articleController.js');

router.get('/', articleController.getArticles);
router.get('/login', userController.login);
router.post('/login', userController.loginHandler);
router.get('/register', userController.register);
router.post('/register', userController.registerHandler);

module.exports = router;