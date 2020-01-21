var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema(
	{
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
		Comment: {
			type: Schema.Types.ObjectId,
			ref: "Comment"
		}
	},
	//Create virtuals to access toObject() method on documents.
	{
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		}
	}
);

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
