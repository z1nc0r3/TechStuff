// Required modules
const express = require("express");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

// Database connection
const database = require("./server/config/database.js");

// Server setup
const PORT = 3000; // Port number is predefined
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// Database connection
app.listen(PORT, async () => {
	await database();
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
			maxAge: 60 * 60 * 1000 * 24, // Session will last 24 hours
		},
	})
);

// Flash
app.use(flash());

// Routes
app.use("/", require("./server/routes/index.js"));

// Handle 404
app.get("*", (req, res) => {
	res.locals.firstname = req.session.firstname;
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.userId = req.session.userId;
	res.status(404).render("404", { title: "Page Not Found" });
});

// Closing database connection in case of server termination
process.on("SIGTERM", () => {
	app.close(() => {
		database.client.close();
	});
});
