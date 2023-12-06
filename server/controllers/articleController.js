const Articles = require("../models/articles.js");
const multer = require("multer");

// Multer storage for image upload
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
	res.locals.profileImage = req.session.profileImage;
	
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
			const profileImage = req.session.profileImage;

			// Add new article
			const article = new Articles({
				headline,
				subheadline,
				content,
				author,
				userId,
				image,
				profileImage
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

// Edit article
exports.editArticle = async (req, res) => {
	// If user is not logged in, redirect to login page
	if (!req.session.isLoggedIn) {
		return res.redirect("/login");
	}

	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;

	const articleId = req.params.id;
	const article = await Articles.findOne({ _id: articleId });

	const title = "Edit Article";
	res.render("article/edit", { title, article });
};

// Edit article handler
exports.editArticleHandler = async (req, res) => {
	try {
		upload.single("image")(req, res, async function (err) {
			if (err instanceof multer.MulterError) {
				return res.status(500).json(err);
			} else if (err) {
				return res.status(500).json(err);
			}

			// Get user data
			const articleId = req.params.id;
			const { headline, subheadline, content } = req.body;
			const userId = req.session.userId;

			// If the user uploaded a new image, update the image
			if (req.file) {
				var image = {
					data: req.file.buffer,
					contentType: req.file.mimetype,
				};

				// Update article
				await Articles.findOneAndUpdate(
					{ _id: articleId },
					{
						headline,
						subheadline,
						content,
						userId,
						image,
					}
				);
			} else {
				// Otherwise, do not update the image
				// Update article
				await Articles.findOneAndUpdate(
					{ _id: articleId },
					{
						headline,
						subheadline,
						content,
						userId,
					}
				);
			}

			res.redirect("/article/" + articleId);
		});
	} catch (error) {
		console.log(error);
		res.redirect("/add", { error: "Error editing the article." });
	}
};

// Delete article
exports.deleteArticle = async (req, res) => {
	try {
		const articleId = req.body.id;
		await Articles.findOneAndDelete({ _id: articleId });
		res.redirect("/");
	} catch (error) {
		console.log(error);
		res.redirect("/", { error: "Error deleting the article." });
	}
};
