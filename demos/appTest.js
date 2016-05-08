$(document).ready(function(){
	// 'enter' in textbox executes search
	$('#ingredients').keypress(function(e){
		if(e.keyCode==13)
		$('#search_btn').click();
	});
	// handles initial searches
		$("#search_btn").click(function(){
		$("#load_more").data("page", 0).hide();
		$("#contents div").remove();
		$(this).prop("disabled", true);
		doSearch();
	});
	// handles continuing searches
	$("#load_more").click(function(e){
		$(this).prop("disabled", true);
		doSearch();
	});
	// sets up initial pagination params
	$("#load_more").data("page", 0).hide();
});

// performs a search, new or continuing
function doSearch(){
	// initial setup
	$(this).prop("disabled",true);
	var _contents = $("#contents");
	var load_more_button = $("#load_more");
	var currPage = load_more_button.data("page");
	$("#busy").hide().html("<span class='glyphicon glyphicon-repeat spinner' style='font-size: 3em;'></span>").slideDown();
	// build request URL
	var _root = "http://food2fork.com/api/search";
	var _key = "5277c1f10edffc95b8f09146f773b56c";
	var _ingredients = encodeURIComponent($("#ingredients").val());
	var _page = currPage + 1;
	var _url = _root + "?key=" + _key + "&q=" + _ingredients + "&page=" + _page;
	var query = "select * from json where url=\"" + _url + "\""
	makeRequest(_contents, query); // send and process HTTP request
	load_more_button.data().page++; // update button
}

// handle CORS/JSONP AJAX requests via YQL
function makeRequest(page, query){
	$.getJSON(
		"http://query.yahooapis.com/v1/public/yql",
		{
		q: query,
		format: "json"
		},
		function(response, status){
			if (status){ // process successful request
				console.log(status);
				var json = response.query.results;
				console.log(json);
				$.each(json, function(i, element){ // process each recipe
					if (element){
						if (element.count == 1){
							processRecipe(page, element.recipes, 0);
						}
						else if(element.count > 0){
							var nextItemIndex = $("#contents .box").size();
							$.each(element.recipes, function(i, recipe){
								processRecipe(page, recipe, i);
							});
							$($("#contents .box").get(nextItemIndex)).scrollView();
							$("#load_more").show().prop("disabled", false);
						}
						
						else if (element.count <= 0) {
						  
						        alert("No results found.");
						    
						}
						
						if (element.count != 30) {
							$("#load_more").slideUp();
							return false;
						}
					}
				});	
				$("#search_btn").prop("disabled", false);
				$("#busy").slideUp();
			}
		}
	).error(function(){
		$("#busy").slideUp().empty();
		$("#load_more").slideUp();
	});
}

// parse recipe and add to the page
function processRecipe(page, recipe, delayMult){
	var newBox = $("<div class='box'><a target='_blank' href='" +
		recipe.f2f_url + "'><img alt='" +
		recipe.title + "' class='thumb' src='" +
		recipe.image_url + "'>" + "<div class='text-box'><p class='text-box-text'>" +
		recipe.title + "</p></div></a></div>");
	page.append(newBox);
	newBox.hide().delay(75 * delayMult).fadeIn(750).css("display","inline-block");
}

// auto scroll-to function
$.fn.scrollView = function () {
	return this.each(function () {
		$('html, body').animate({
		scrollTop: $(this).offset().top
		}, 750);
	});
}