$(document).on('pageinit', function() {
	// 'enter' in textbox executes search
	$('#ingredients').keypress(function(e){
		if(e.keyCode==13)
		$('#search_btn').click();
	});
	// handles initial searches
	$("#search_btn").click(function(){
		$("#load_more").data("resultPage", 0);
		$("#indicators").hide();
		$("#contents").empty();
		//$('contents li:not(:last)').remove(); // remove everything except the load_more button
		$(this).button("disable");
		doSearch();
	});
	// handles continuing searches
	$("#load_more").click(function(e){
		$(this).button("disable");
		doSearch();
	});
	// sets up initial pagination params
	$("#load_more").data("resultPage", 0);
	
	// hides the load more button if there are no results displayed
	if ($("#contents li").size() == 0){
		$("#indicators").hide();
	}
});

/* PERFORMS A SEARCH, NEW OR CONTINUING */
function doSearch(){
	// initial setup
	var _contents = $("#contents");
	var load_more_button = $("#load_more");
	var currPage = load_more_button.data("resultPage");
	$("#busy").hide().html("<span class='spinner'>Loading...</span>").slideDown();
	// build request URL
	var _root = "http://food2fork.com/api/search";
	var _key = "5277c1f10edffc95b8f09146f773b56c";
	var _ingredients = encodeURIComponent($("#ingredients").val());
	var _page = currPage + 1;
	var _url = _root + "?key=" + _key + "&q=" + _ingredients + "&page=" + _page;
	var query = "select * from json where url=\"" + _url + "\""
	makeRequest(_contents, query); // send and process HTTP request
	load_more_button.data().resultPage++; // update button
}

/* HANDLE CORS/JSONP AJAX REQUESTS VIA YQL */
function makeRequest(page, query){
	$.getJSON(
		"http://query.yahooapis.com/v1/public/yql",
		{
		q: query,
		format: "json"
		},
		function(response, status){
			if (status){ // process successful request
				var json = response.query.results;
				$.each(json, function(i, element){ // process each recipe
					if (element){
						if (element.count == 1){
							processRecipe(page, element.recipes);
						}
						else if(element.count > 0){
							var nextItemIndex = $("#contents li").size();
							$.each(element.recipes, function(i, recipe){
								processRecipe(page, recipe);
							});
							$($("#contents li").get(nextItemIndex)).scrollView();
							
							$("#indicators").show();
							$("#load_more").show().button("enable");
						}
						else if(element.count <= 0){
							$("#contents").append($("<li class='center'><h2>NO RESULTS FOUND</h2><h5>Try modifying your search terms</h5><li>"));
						}
						if (element.count != 30) {
							$("#indicators").slideUp();
							return false;
						}
					}
				});	
				$("#search_btn").button("enable");
				$("#busy").slideUp();
			}
		}
	).error(function(){
		$("#indicators").slideUp();
	});
}

/* PARSE RECIPE AND ADD TO THE PAGE */
function processRecipe(page, recipe){
	var newRecipe = $("<li><a target='_blank' href='" +
		recipe.f2f_url + "'><img alt='" +
		recipe.title + "' src='" +
		recipe.image_url + "' /><h3>" +
		recipe.title + "</h3><p> Publisher: " +
		recipe.publisher + "</p></a></li>");
	page.append(newRecipe).listview('refresh');
}

/* AUTO SCROLL-TO FUNCTION */
$.fn.scrollView = function () {
	return this.each(function () {
		$('html, body').animate({
		scrollTop: $(this).offset().top
		}, 750);
	});
}