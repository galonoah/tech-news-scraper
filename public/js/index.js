$(function() {
	// Create user in DB and store ID in local storage
	if (!localStorage.id) {
		$.ajax({
			method: "POST",
			url: "/user"
		}).then(function(result) {
			localStorage.setItem("id", result._id);
		})
	}

	// Click even to scrape articles
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

	let articleId;
	// Add click event to submit button and save comment into mongoDB
	$(".saveComment").on("click", function(e) {
		e.preventDefault();

		let comment = $(this)
			.siblings(".comment")
			.val();

		// Make Post request to save comment to DB
		$.ajax({
			method: "POST",
			url: "/articles/" + articleId,
			data: { comment: comment }
		}).then(function(result) {
			console.log("Save comment");
			showComments(articleId);
		});

		// Clear input comment
		$(this)
			.siblings(".comment")
			.val("");
	});

	// Show comments for specific article
	$(".viewCommentsButton").on("click", function(){
		articleId = $(this).data("id");
		$(".saveComment").attr("data-id", articleId);
		showComments(articleId);
	});

	// Delete comment
	$(".comments__list").on("click", ".removeComment",  function() {
		$.ajax({
			method: "PUT",
			url: "/comment/" + $(this).data("id")
		}).then(function(result) {
			console.log("Comment deleted: ", result);
			showComments(articleId);
		});
	});

	// Function gets all comments from specific article
	function showComments(articleId){
			$.ajax({
				method: "GET",
				url: "/articles/" + articleId
			}).then(function(result) {
				$(".comments__list").empty();
				for (let comments of result) {
					let button = $("<button>").text("X").attr({
						"data-id": comments._id,
						"class": "removeComment"
					});
					let list = $("<li>").text(comments.comment);
					let span = $("<span>").text(new Date(comments.dateCreated).toLocaleDateString({ formatMatcher: "basic" }));
					list.append(span, button);
					$(".comments__list").append(list);
				}
			});
	}
});
