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

exports.login = async (req, res) => {
	const title = "Login";
	res.render("login", { title });
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
