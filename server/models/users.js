const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	email: { type: String, unique: true },
	password: String,
	image: {
		data: Buffer,
		contentType: String,
	},
});

module.exports = mongoose.model("User", userSchema);
