var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	comment: {
		type: String,
		required: true
	},
	dateCreated: {
		type: Date,
		default: Date.now
	}
});

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
