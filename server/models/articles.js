const mongoose = require("mongoose");

const articleSheme = new mongoose.Schema({
	headline: string,
	subheadline: string,
	content: string,
	author: string,
	image: {
		data: Buffer,
		contentType: String,
	},
});

module.exports = mongoose.model("Article", articleSheme);