// Required modules
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const database = require("./server/config/database.js");

const session = require("express-session");
const connectDB = require("./server/config/database.js");

const PORT = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Database connection
app.listen(PORT, async () => {
	await connectDB();
	console.log(`Server started on port ${PORT}`);
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
	session({
		secret: "mern-crud-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 60 * 60 * 1000 * 24, // 24 hours
		},
	})
);

// Routes
app.use("/", require("./server/routes/index.js"));

// Handle 404
app.get("*", (req, res) => {
	res.status(404).render("404");
});

process.on("SIGTERM", () => {
	app.close(() => {
		database.client.close();
	});
});
