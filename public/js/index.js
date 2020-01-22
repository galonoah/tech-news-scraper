$(function() {
	let areArticlesEmpty = $(".articles").children().length === 0;
	if (localStorage.id && areArticlesEmpty) {
		window.location.href = "/user/" + localStorage.getItem("id");
	} else if (!localStorage.id) {
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
			url: "/scrape/user/" + localStorage.getItem("id")
		}).then(function(result) {
			window.location.href = "/user/" + localStorage.getItem("id");
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
