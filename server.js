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
mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });

/*=============================================
=                 Routes                     =
=============================================*/

// Root Route
app.get("/", function(req, res){
  res.render("index");
});

// A Get route to to render users' articles
app.get("/user/:id", function(req, res){
  db.User.findOne({_id: req.params.id})
    .populate("articles")
    .then(function(userData){

      let articlesArray = [];
      userData.articles.forEach(article => articlesArray.push(article.toObject()));
      
			res.render("index", {articles: articlesArray});
    })
    .catch(function(error){
      console.log(error);
    });
});

// User route
app.post("/user", function(req, res){
  db.User.create({})
		.then(function(user) {
			res.json(user);
		})
		.catch(function(err) {
			res.json(err);
		});
});

// A GET route for scraping the 'Next Web' website
app.get("/scrape/user/:id", function(req, res) {
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
				.then(article =>{
          return db.User.findOneAndUpdate({_id: req.params.id}, { $push: { articles: article._id } }, { new: true });
        })
        .then(result=> console.log(result))
				.catch(error => {
          if (error.name === "MongoError" && error.code === 11000) {
            // Log error message for articles duplicate titles
						console.log(error.errmsg);
					} else {
						console.log(error);
					}
				});
    })
		res.end();
	});
});

// // Route for getting all Articles from mongoDB
// app.get("/articles", function(req, res) {

//   db.Article.find({})
//     .then(articles => {
//       // Convert each article into a plain javascript object to resolve issue:
//       // Handlebars: Access has been denied to resolve the property <field name> 
//       // because it is not an "own property" of its parent.
//       let articlesArray = [];
//       articles.forEach(article => articlesArray.push(article.toObject()));

//       res.render("index", {articles: articlesArray});
//     })
//     .catch(error => res.json(error));
// });

// Route for grabbing a specific Article by id, populate it with its comments
// app.get("/articles/:id", function(req, res) {
//   db.Article.findOne({ _id: req.params.id })
//     .populate("comment")
//     .then(function(dbArticle) {
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

// Route for saving/updating an Article's associated Comment
// app.post("/articles/:id", function(req, res) {
//   db.Comment.create(req.body)
//     .then(function(comment) {
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { comment: comment._id }}, { new: true });
//     })
//     .then(function(article) {
//       res.json(article);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

// app.get("*", (req, res) => res.redirect("/"));

app.listen(3000, function() {
	console.log("App running on port " + 3000);
});