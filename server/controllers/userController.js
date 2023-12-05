const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ObjectID = require("mongodb").ObjectId;

const Users = require("../models/users.js");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

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
	res.render("user/register", { title });
};

// User registration handler
exports.registerHandler = async (req, res) => {
	try {
		upload.single("image")(req, res, async function (err) {
			if (err instanceof multer.MulterError) {
				return res.status(500).json(err);
			} else if (err) {
				return res.status(500).json(err);
			}

			// Get user data
			const { firstname, lastname, email, password } = req.body;
			const image = {
				data: req.file.buffer,
				contentType: req.file.mimetype,
			};

			// Create new user
			const user = new Users({
				firstname,
				lastname,
				email,
				password,
				image,
			});

			await user.save();
			res.redirect("/");
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}
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

	// If user is not logged in, redirect to login page
	if (!req.session.isLoggedIn) {
		return res.redirect("/login");
	}

	try {
		const { userId } = req.session;
		const user = await Users.findById(userId);
		const profileImage = user.image.data.toString("base64");
		const title = "Account";
		res.render("user/account", { title, user, profileImage });
	} catch (error) {
		console.log(error);
		res.redirect("/");
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
		res.render("user/update", { title, user });
	} catch (error) {
		console.log(error);
		res.redirect("user/account");
	}
};

// User update handler
exports.updateHandler = async (req, res) => {
	try {
		const { firstname, lastname, email } = req.body;

		// Update user
		await Users.updateOne(
			{ _id: new ObjectID(req.session.userId) },
			{ email: email, firstname: firstname, lastname: lastname }
		);

		// Update session
		req.session.firstname = firstname;
		
		res.redirect("/account");
	} catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}
};

// Delete user
exports.deleteUser = async (req, res) => {
	const confirmed = req.query.confirmation;

    if (confirmed !== "true") {
		return res.redirect("/account");
    }

	const id = req.session.userId;
	try {
		const deletedUser = await Users.findByIdAndDelete(new ObjectID(id));

		if (!deletedUser) {
			console.log("User not found");
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
		res.status(500).redirect("/account");
	}
};
