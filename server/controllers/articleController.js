const mongoose = require("mongoose");
const Articles = require("../models/articles.js");
const Users = require("../models/users.js");

// Get all articles
exports.getArticles = async (req, res) => {
	const title = "Home";
	res.render("home", { title });
}
