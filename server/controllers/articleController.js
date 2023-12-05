const mongoose = require("mongoose");
const Articles = require("../models/articles.js");
const Users = require("../models/users.js");
const multer = require("multer");
const ObjectID = require("mongodb").ObjectId;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all articles
exports.getArticles = async (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;

	const title = "Home";
	const articles = await Articles.find().sort({ _id: -1 });
	res.render("home", { title, articles });
};

// Add article page
exports.addArticle = async (req, res) => {
	// If user is not logged in, redirect to login page
	if (!req.session.isLoggedIn) {
		return res.redirect("/login");
	}

	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;

	const title = "Add New";
	res.render("article/add", { title });
};

// Add article handler
exports.addArticleHandler = async (req, res) => {
	try {
		upload.single("image")(req, res, async function (err) {
			if (err instanceof multer.MulterError) {
				return res.status(500).json(err);
			} else if (err) {
				return res.status(500).json(err);
			}

			// Get user data
			const { headline, subheadline, content } = req.body;
			const userId = req.session.userId;
			const author = req.session.firstname + " " + req.session.lastname;
			const image = {
				data: req.file.buffer,
				contentType: req.file.mimetype,
			};

			// Add new article
			const article = new Articles({
				headline,
				subheadline,
				content,
				author,
				userId,
				image,
			});

			await article.save();
			res.redirect("/");
		});
	} catch (error) {
		console.log(error);
		res.redirect("/add", { error: "Error creating new article." });
	}
};

// View article
exports.viewArticle = async (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;

	const articleId = req.params.id;
	const article = await Articles.findOne({ _id: articleId });

	const title = article.headline;
	res.render("article/view", { title, article });
};