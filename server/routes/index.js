const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const articleController = require("../controllers/articleController.js");

// Login routes
router.get("/login", userController.login);
router.post("/login", userController.loginHandler);

// Register routes
router.get("/register", userController.register);
router.post("/register", userController.registerHandler);

// Logout route
router.get("/logout", userController.logout);

// Account route
router.get("/account", userController.account);

// Account actions
router.get("/update", userController.update);
router.post("/update", userController.updateHandler);
router.post("/user/delete", userController.deleteUser);

// Show all articles
router.get("/", articleController.getArticles);

// Add article
router.get("/add", articleController.addArticle);
router.post("/add", articleController.addArticleHandler);

// Show article
router.get("/article/:id", articleController.viewArticle);

// Edit article
router.get("/article/edit/:id", articleController.editArticle);
router.post("/article/edit/:id", articleController.editArticleHandler);

// Delete article
router.post("/article/delete", articleController.deleteArticle);

module.exports = router;
