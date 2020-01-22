$(function() {

	if (localStorage.id) {
		console.log("Get associated articles to user");
	} else {
		$.ajax({
			method: "POST",
			url: "/user"
		}).then(function(result) {
			localStorage.setItem("id", result._id);
		})
	}

	$("#scrapeButton").on("click", function() {
		$.ajax({
			method: "GET",
			url: "/scrape"
		}).then(function(result) {
			location.reload();
		});
	});

	// Save articles to favorites
	$(".saveArticleButton").on("click", function(e){
		e.preventDefault();

		let data = {
			articleId: $(this).data("id"),
			userId: localStorage.getItem("id")
		}

		$.ajax({
			method: "POST",
			url: "/articles/save",
			data: data
		}).then(function(result){
			console.log("Article saved")
		});
	});
	
	// View Saved Articles
	$("#viewSavedArticles").on("click", function(e){
		e.preventDefault();
		window.location.href = "/articles/save/user/" + localStorage.getItem("id");
	});

	// Remove articles from favorites
	$(".deleteButton").on("click", function(e){
		e.preventDefault();
		let data = {
			articleId: $(this).data("id"),
			userId: localStorage.getItem("id")
		};
		$.ajax({
			method: "PUT",
			url: "/article/update",
			data: data
		}).then(function(){
			location.reload();
		});
	});

	// Add click event to submit button and save comment into mongoDB
	$(".saveComment").on("click", function(e) {
		e.preventDefault();
		// Get article id and comment text
		let id = $(this).data("id");
		let comment = $(this)
			.siblings(".comment")
			.val();

		// Make Post request to save comment to DB
		$.ajax({
			method: "POST",
			url: "/articles/" + id,
			data: { comment: comment }
		}).then(function(result) {
			console.log("Save comment");
		});

		// Clear input comment
		$(this)
			.siblings(".comment")
			.val("");
	});
});
