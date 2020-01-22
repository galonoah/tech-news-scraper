var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	articles: [
		{
			type: Schema.Types.ObjectId,
			ref: "Article"
		}
	],
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
