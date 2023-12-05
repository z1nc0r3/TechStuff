const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const Users = require("../models/users.js");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/uploads/");
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({ storage: storage }).single("image");

// User login page
exports.login = async (req, res) => {
	// If user is already logged in, redirect to home page
	if (req.session.isLoggedIn) {
		return res.redirect("/");
	}
	
    const title = "Login";
    const message = req.flash('error');
	console.log(message);
    res.render("user/login", { title, message });
};

// User login handler
exports.loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email, password });

        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        req.session.firstname = user.firstname;
        res.redirect("/");
    } catch (error) {
        console.log(error);
        req.flash('error', 'An error occurred.');
        res.redirect("/login");
    }
};

// User registration page
exports.register = async (req, res) => {
	const title = "Register";
	res.render("user/register", { title });
};

// User registration handler
exports.registerHandler = async (req, res) => {
	try {
		upload(req, res, async function (err) {
			if (err instanceof multer.MulterError) {
				return res.status(500).json(err);
			} else if (err) {
				return res.status(500).json(err);
			}

			// Get user data
			const { firstname, lastname, email, password } = req.body;
			const imagePath = path.join(__dirname, "../../public/uploads/", req.file.filename);
			const image = {
				data: fs.readFileSync(imagePath),
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
