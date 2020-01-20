var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var app = express();

/*=============================================
=                 Routes                     =
=============================================*/

// A GET route for scraping the 'Next Web' website
app.get("/scrape/page/:number?", function(req, res) {
  var page = req.params.number || "";
  axios.get("https://thenextweb.com/latest/page/" + page).then(function(response) {
    var $ = cheerio.load(response.data);
    let data = [];
    $(".story").each(function(i, el){
      var newsData = {};
      newsData.date = $(this).find("time").attr("datetime");
      newsData.imgUrl = $(this).children("a").data("src");
      newsData.summary = $(this).find(".story-chunk").text().trim();
      newsData.title = $(this).find(".story-title").text().trim();
      newsData.url = $(this).find(".story-title > a").attr("href");
      data.push(newsData);
    });
    res.json(data);
	});
});

app.listen(3000, function() {
	console.log("App running on port " + 3000);
});
