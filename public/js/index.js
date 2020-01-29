$(function() {
	// Create user in DB and store ID in local storage
	if (!localStorage.id) {
		$.ajax({
			method: "POST",
			url: "/user"
		}).then(function(result) {
			localStorage.setItem("id", result._id);
		});
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
	$(".saveArticleButton").on("click", function(e) {
		e.preventDefault();

		let data = {
			articleId: $(this).data("id"),
			userId: localStorage.getItem("id")
		};

		$.ajax({
			method: "POST",
			url: "/articles/save",
			data: data
		}).then(function(result) {
			console.log("Article saved");
			disableButtonforSavedArticles();
		});
	});

	// View Saved Articles
	$("#viewSavedArticles").on("click", function(e) {
		e.preventDefault();
		window.location.href = "/articles/save/user/" + localStorage.getItem("id");
	});

	// Remove articles from favorites
	$(".deleteButton").on("click", function(e) {
		e.preventDefault();
		let data = {
			articleId: $(this).data("id"),
			userId: localStorage.getItem("id")
		};
		$.ajax({
			method: "PUT",
			url: "/article/update",
			data: data
		}).then(function() {
			location.reload();
		});
	});

	let articleId;
	// Add click event to submit button and save comment into mongoDB
	$(".saveComment").on("click", function(e) {
		e.preventDefault();
		let comment = $(this)
			.siblings(".field")
			.children(".comment-text")
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
			.siblings(".field")
			.children(".comment-text")
			.val("");
	});

	// Show comments for specific article
	$(".viewCommentsButton").on("click", function() {
		$(".ui.modal").modal("show");
		articleId = $(this).data("id");
		$(".saveComment").attr("data-id", articleId);
		showComments(articleId);
	});

	// Delete comment
	$(".comments__list").on("click", ".removeComment", function() {
		$.ajax({
			method: "PUT",
			url: "/comment/" + $(this).data("id")
		}).then(function(result) {
			console.log("Comment deleted: ", result);
			showComments(articleId);
		});
	});

	// Function gets all comments from specific article
	function showComments(articleId) {
		$.ajax({
			method: "GET",
			url: "/articles/" + articleId
		}).then(function(result) {
			$(".comments__list").empty();

			if (result.length) {
				for (let comments of result) {
					let item = $("<div>").addClass("ui clearing segment");
					let button = $("<button>")
						.html("<i class='trash icon'></i>")
						.attr({
							"data-id": comments._id,
							class: "removeComment"
						});
					button.addClass("mini ui right floated red button");

					let content = $("<div>").addClass("ui segment content");
					content.text(comments.comment);

					let date = $("<div>").addClass("ui mini label");
					date.text(new Date(comments.dateCreated).toLocaleDateString({ formatMatcher: "basic" }));

					item.append(button, date, content);
					$(".comments__list").append(item);
				}
			} else {
				$(".comments__list").removeClass("segments");
				$(".comments__list").append("<div>").html("<h4 class='ui header'>No Comments</h4>");
			}
		});
	}
	function disableButtonforSavedArticles() {
		// Disable 'Add to Favorites' button
		$.ajax({
			method: "GET",
			url: "/articles/save/user/" + localStorage.getItem("id") + "/true"
		}).then(function(result) {
				let savedArticlesIds = result.map(function(article){
						return article._id;
				});
				$(".articles")
					.children()
					.each(function(i, el) {
						if (savedArticlesIds.includes(el.dataset.id)){
							 $("[data-id=" + el.dataset.id + "]").find(".button").text("Saved");
							 $("[data-id=" + el.dataset.id + "]").find(".button").addClass("disabled");
						}
					});
		});
	}
	disableButtonforSavedArticles();
});
