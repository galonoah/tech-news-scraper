$(function() {
	let areArticlesEmpty = $(".articles").children().length === 0;

	if (localStorage.id) {
		console.log("Get associated articles to user");
	} else {
		$.ajax({
			method: "POST",
			url: "/user"
		}).then(function(result) {
			localStorage.setItem("id", result._id);
		});
	}

	$("#scrapeButton").on("click", function() {
		$.ajax({
			method: "GET",
			url: "/scrape"
		}).then(function(result) {
			console.log("Getting Articles...")
			// window.location.href = "/user/" + localStorage.getItem("id");
		});
	});

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

	$("#viewSavedArticles").on("click", function(e){
		e.preventDefault();

		window.location.href = "/articles/save/user/" + localStorage.getItem("id");
	// 	$.ajax({
	// 		method: "GET",
	// 		url: "/articles/save",
	// 		data: { userId: localStorage.getItem("id") }
	// 	}).then(function(result) {
	// 		console.log("Show save articles");
	// 	});
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
