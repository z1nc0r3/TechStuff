const mongoose = require("mongoose");
const Articles = require("../models/articles.js");
const Users = require("../models/users.js");

// Get all articles
exports.getArticles = async (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;

	console.log(res.locals);

	const title = "Home";
	res.render("home", { title });
}
