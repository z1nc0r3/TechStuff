const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	email: String,
	password: String,
	image: {
		data: Buffer,
		contentType: String,
	},
});

module.exports = mongoose.model("User", userSchema);