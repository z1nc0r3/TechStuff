const mongoose = require("mongoose");

// Article schema
const articleSheme = new mongoose.Schema({
	headline: String,
	subheadline: String,
	content: String,
	author: String,
	userId: String,
	image: {
		data: Buffer,
		contentType: String,
	},
	profileImage: {
		data: Buffer,
		contentType: String,
	},
});

module.exports = mongoose.model("Article", articleSheme);
