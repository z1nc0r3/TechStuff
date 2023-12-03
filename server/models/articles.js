const mongoose = require("mongoose");

const articleSheme = new mongoose.Schema({
	headline: String,
	subheadline: String,
	content: String,
	author: String,
	image: {
		data: Buffer,
		contentType: String,
	},
});

module.exports = mongoose.model("Article", articleSheme);