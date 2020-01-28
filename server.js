var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var app = express();

var PORT = 3000;

var db = require("./models");

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});

/*=============================================
=                 Routes                     =
=============================================*/

// Root Route
app.get("/", function(req, res) {
	res.redirect("/articles");
});

// User route
app.post("/user", function(req, res) {
	db.User.create({})
		.then(function(user) {
			res.json(user);
		})
		.catch(function(err) {
			res.json(err);
		});
});

// A GET route for scraping the 'Next Web' website
app.get("/scrape", function(req, res) {
	axios.get("https://thenextweb.com/latest/").then(function(response) {
		var $ = cheerio.load(response.data);

		$(".story").each(function(i, el) {
			// Create object to store article data
			var articleData = {};
			articleData.date = $(this)
				.find("time")
				.attr("datetime");
			articleData.imgUrl = $(this)
				.children("a")
				.data("src");
			articleData.summary = $(this)
				.find(".story-chunk")
				.text()
				.trim();
			articleData.title = $(this)
				.find(".story-title")
				.text()
				.trim();
			articleData.url = $(this)
				.find(".story-title > a")
				.attr("href");

			// Save article to database
			db.Article.create(articleData)
				.then(article => {
					console.log("Article saved to DB");
				})
				.catch(error => {
					if (error.name === "MongoError" && error.code === 11000) {
						// Log error message for articles duplicate titles
						console.log(error.errmsg);
					} else {
						console.log(error);
					}
				});
		});
		res.end();
	});
});

// Route for getting all Articles from mongoDB
app.get("/articles", function(req, res) {
	db.Article.find({})
		.sort({ date: "desc" })
		.then(articles => {
			// Convert each article into a plain javascript object to resolve issue:
			// Handlebars: Access has been denied to resolve the property <field name>
			// because it is not an "own property" of its parent.
			let articlesArray = [];
			articles.forEach(article => articlesArray.push(article.toObject()));

			res.render("index", { articles: articlesArray, isEmpty: !articlesArray.length });
		})
		.catch(error => res.json(error));
});

// Save articles to favorites
app.post("/articles/save", function(req, res) {
	db.User.findById({ _id: req.body.userId })
		.then(function(userData) {
			// Check if article exist in users' articles list
			// return boolean confirmation
			return userData.articles.includes(req.body.articleId);
		})
		.then(function(articleSaved) {
			// if article is not in user's favorites, then add article
			if (!articleSaved) {
				return db.User.findByIdAndUpdate({ _id: req.body.userId }, { $push: { articles: req.body.articleId } }, { new: true });
			}
		})
		.then(function(result) {
			console.log("Favorite articles modified");
		})
		.catch(function(error) {
			console.log(error);
		});
	res.end();
});

// View Saved Articles
app.get("/articles/save/user/:id", function(req, res) {
	db.User.findById({ _id: req.params.id })
		.populate("articles")
		.then(function(userArticles) {
			let articlesArray;
			if (userArticles) {
				articlesArray = userArticles.articles.map(article => article.toObject()) || [];
			} else {
				articlesArray = [];
			}
			res.render("saved-articles", { articles: articlesArray, isEmpty: !articlesArray.length });
		})
		.catch(function(error) {
			console.log(error);
		});
});

// Remove articles from favorites
app.put("/article/update", function(req, res) {
	//Find User ID and get user Data
	db.User.findById({ _id: req.body.userId })
		.then(function(userData) {
			// Loop through User's saved articles and remove/update articles array
			userData.articles.forEach(function(article) {
				if (article.toString() === req.body.articleId) {
					// Remove article
					userData.articles.remove(req.body.articleId);
					// Save updated articles array
					userData.save(function(err, result) {
						if (err) throw err;
						console.log("Removed Article id: " + req.body.articleId + " from User Id: " + req.body.userId);
						res.end();
					});
				}
			});
		})
		.catch(function(error) {
			console.log(error);
		});
});

// Route for grabbing a specific Article by id, populate it with its comments
app.get("/articles/:id", function(req, res) {
	db.Article.findById({ _id: req.params.id })
		.populate("comments")
		.then(function(dbArticle) {
			let commentsArray;
			if (dbArticle) {
				commentsArray = dbArticle.comments.map(comment => comment.toObject());
			} else {
				comments = [];
			}
			res.json(commentsArray);
		})
		.catch(function(err) {
			res.json(err);
		});
});

//Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function(req, res) {
	db.Comment.create(req.body)
		.then(function(comment) {
			return db.Article.findByIdAndUpdate({ _id: req.params.id }, { $push: { comments: comment._id } }, { new: true });
		})
		.then(function() {
			res.end();
		})
		.catch(function(err) {
			res.json(err);
		});
});

//Remove Comment from DB
app.put("/comment/:id", function(req, res) {
	db.Comment.findByIdAndDelete({ _id: req.params.id })
		.then(function(result) {
			res.json(result);
		})
		.catch(function(error) {
			console.log(error);
		});
});

app.get("*", (req, res) => res.redirect("/articles"));

app.listen(3000, function() {
	console.log("App running on port " + 3000);
});
