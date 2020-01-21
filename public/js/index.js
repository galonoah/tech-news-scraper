$(function(){
  $(".saveComment").on("click", function(e) {
    e.preventDefault();

   let id = $(this).data("id");
   let comment = $(this).siblings(".comment").val();

    $.ajax({
      type: "POST",
      url: "/articles/" + id,
      data: {comment: comment}
    }).then(function(result){
      console.log("Save comment");
    });
      $(this)
				.siblings(".comment")
				.val("");
	});
});

