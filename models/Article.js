var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	date: {
		type: String,
		required: true
	},
	imgUrl: {
		type: String,
		required: true
	},
	summary: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true,
		unique: true
	},
	url: {
		type: String,
		required: true
	},
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
