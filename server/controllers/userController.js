const multer = require("multer");
const ObjectID = require("mongodb").ObjectId;
const fs = require("fs").promises;

// Models
const Users = require("../models/users.js");
const Articles = require("../models/articles.js");

// Multer storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 1000000 } });

// User login page
exports.login = async (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;

	// If user is already logged in, redirect to home page
	if (req.session.isLoggedIn) {
		return res.redirect("/");
	}

	const title = "Login";
	const message = req.flash("error");
	res.render("user/login", { title, message });
};

// User login handler
exports.loginHandler = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await Users.findOne({ email, password });

		if (!user) {
			req.flash("error", "Invalid email or password.");
			return res.redirect("/login");
		}

		req.session.isLoggedIn = true;
		req.session.userId = user._id;
		req.session.firstname = user.firstname;
		req.session.lastname = user.lastname;
		req.session.profileImage = user.image;

		res.redirect("/");
	} catch (error) {
		console.log(error);
		req.flash("error", "An error occurred.");
		res.redirect("/login");
	}
};

// User registration page
exports.register = async (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;

	// If user is already logged in, redirect to home page
	if (req.session.isLoggedIn) {
		return res.redirect("/");
	}

	const title = "Register";
	const message = req.flash("error");
	res.render("user/register", { title, message });
};

// User registration handler
exports.registerHandler = async (req, res) => {
	upload.single("image")(req, res, async function (err) {
		try {
			if (err instanceof multer.MulterError || err) {
				// If the file size is too large, redirect to the registration page with an error message
				if (err.code === "LIMIT_FILE_SIZE") {
					req.flash("error", "Image size too large.");
				} else {
					req.flash("error", "An error occurred.");
				}

				return res.redirect("/register");
			}

			const { firstname, lastname, email, password } = req.body;

			// If user didn't upload a image, use default image
			if (!req.file) {
				req.file = {
					buffer: await fs.readFile("public/images/avatar.jpg"),
					mimetype: "image/png",
				};
			}

			const image = {
				data: req.file.buffer,
				contentType: req.file.mimetype,
			};

			// Create new user
			const newUser = new Users({
				firstname,
				lastname,
				email,
				password,
				image,
			});

			await newUser.save();
			res.redirect("/login");
		} catch (error) {
			console.log(error);
			if (error.code === 11000) {
				req.flash("error", "Email already exists.");
			} else {
				req.flash("error", "An error occurred.");
			}

			return res.redirect("/register");
		}
	});
};

// User logout handler
exports.logout = async (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log(err);
		}
		res.redirect("/");
	});
};

// User account page
exports.account = async (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;
	const title = "Account";

	// If user is not logged in, redirect to login page
	if (!req.session.isLoggedIn) {
		return res.redirect("/login");
	}

	try {
		const { userId } = req.session;
		const user = await Users.findById(userId);
		const profileImage = user.image.data.toString("base64");

		// get articles by userId
		const articles = await Articles.find({ userId: userId }).sort({
			_id: -1,
		});

		res.render("user/account", { title, user, profileImage, articles });
	} catch (error) {
		console.log(error);
		res.redirect("/", { error: "Error getting user data." });
	}
};

// User update page
exports.update = async (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;

	// If user is not logged in, redirect to login page
	if (!req.session.isLoggedIn) {
		return res.redirect("/login");
	}

	try {
		const { userId } = req.session;
		const user = await Users.findById(userId);
		const title = "Update";
		const message = req.flash("error");
		res.render("user/update", { title, user, message });
	} catch (error) {
		console.log(error);
		res.redirect("/account", { error: "Error getting user data." });
	}
};

// User update handler
exports.updateHandler = async (req, res) => {
	try {
		upload.single("image")(req, res, async function (err) {
			if (err instanceof multer.MulterError || err) {
				// If image size is too large, redirect to update page
				if (err.code === "LIMIT_FILE_SIZE") {
					req.flash("error", "Image size too large.");
				} else {
					req.flash("error", "An error occurred.");
				}
				return res.redirect("/update");
			}

			const { firstname, lastname, email } = req.body;

			// If the user uploaded a new image, update the image
			if (req.file) {
				var image = {
					data: req.file.buffer,
					contentType: req.file.mimetype,
				};

				req.session.profileImage = image;

				// Update user
				await Users.updateOne({ _id: new ObjectID(req.session.userId) }, { email: email, firstname: firstname, lastname: lastname, image: image });
			} else {
				// Otherwise, do not update the image
				await Users.updateOne({ _id: new ObjectID(req.session.userId) }, { email: email, firstname: firstname, lastname: lastname });
			}

			// Update session
			req.session.firstname = firstname;
			req.session.lastname = lastname;
			res.redirect("/account");
		});
	} catch (error) {
		console.log(error);
		res.redirect("/account", { error: "Error updating user data." });
	}
};

// Delete user
exports.deleteUser = async (req, res) => {
	const id = req.session.userId;
	try {
		const deletedUser = await Users.findByIdAndDelete(new ObjectID(id));

		if (!deletedUser) {
			return res.status(404).redirect("/account");
		}

		req.session.destroy((err) => {
			if (err) {
				console.error("Error destroying session:", err);
			}
		});
		res.redirect("/");
	} catch (error) {
		console.error("Error deleting user:", error);
		res.redirect("/account", { error: "Error deleting user." });
	}
};
