/*=================
	SPLASH PAGE
=================*/
$(document).on('pageinit', "#splash", function() {
	/* INITIALIZE AND HIDE EVERYTHING */
	$("#logo").find("img").css("width", 0).css("height", 0);
	$("#splashTitle").css('visibility','hidden');
	$("#accreditation").css('visibility','hidden');
	
	/* SHOW AND/OR CHANGE SIZE */
	setTimeout(function(){		// SHOW LOGO
        $("#logo img").fadeIn(1000).css("width", (1003 / 1000 * 50) + "vmin").css("height", (1024 / 1000 * 50) + "vmin");
    }, 500);
	setTimeout(function(){		// FADE IN TITLE
        $("#splashTitle").css('visibility','visible').hide().fadeIn("slow");
    }, 2000);
	setTimeout(function(){		// FADE IN FOOD2FORK CREDIT
        $("#accreditation").css('visibility','visible').hide().fadeIn("slow");
    }, 2500);
	setTimeout(function(){		// GO TO HOME PAGE
        $.mobile.changePage("#home", "fade");
    }, 4000);
	
});

/*=================
	HOME PAGE
=================*/
$(document).on('pageinit', "#home", function() {
	/* 'ENTER' IN TEXTBOX EXECUTES SEARCH */
	$('#ingredients').keypress(function(e){
		if(e.keyCode==13)
		$('#search_btn').click();
	});
	
	/* HANDLES INITIAL SEARCHES */
	$("#search_btn").click(function(){
		$("#load_more").data("resultPage", 0);
		$("#indicators").hide();
		$("#contents").empty();
		$(this).button("disable");
		doSearch();
	});
	
	/* HANDLES CONTINUING SEARCHES */
	$("#load_more").click(function(){
		$(this).button("disable");
		doSearch();
	});
	
	/* SETS UP INITIAL PAGINATION PARAMS */
	$("#load_more").data("resultPage", 0);
	
	/* HIDES THE LOAD MORE BUTTON IF THERE ARE NO RESULTS DISPLAYED */
	if ($("#contents li").size() == 0){
		$("#indicators").hide();
	}
});

/*=================
  SEARCH FUNCTIONS
=================*/
/* PERFORMS A SEARCH, NEW OR CONTINUING */
function doSearch(){
	/* INITIAL SETUP */
	var _contents = $("#contents");
	var load_more_button = $("#load_more");
	var currPage = load_more_button.data("resultPage");
	$("#busy").hide().html("<span class='spinner'>Loading...</span>").slideDown();
	
	/* BUILD REQUEST URL */
	var _root = "http://food2fork.com/api/search";
	var _key = "5277c1f10edffc95b8f09146f773b56c";
	var _ingredients = encodeURIComponent($("#ingredients").val());
	var _page = currPage + 1;
	var _url = _root + "?key=" + _key + "&q=" + _ingredients + "&page=" + _page;
	var query = "select * from json where url=\"" + _url + "\""
	
	makeRequest(_contents, query); // SEND AND PROCESS HTTP REQUEST
	load_more_button.data().resultPage++; // UPDATE BUTTON
}

/* HANDLE CORS/JSONP AJAX REQUESTS VIA YQL */
function makeRequest(page, query){
	/* PERFORM AJAX REQUEST ON QUERY */
	$.getJSON(
		"http://query.yahooapis.com/v1/public/yql",
		{
		q: query,
		format: "json"
		},
		function(response, status){
			if (status){ // PROCESS SUCCESSFUL REQUEST
				var json = response.query.results;
				$.each(json, function(i, element){	// PROCESS EACH RECIPE
					if (element){					// MAKE SURE JSON DATA EXISTS
						if (element.count == 1){	// SINGLE RESULT IS FORMATTED DIFFERENTLY
							processRecipe(page, element.recipes);
						}
						else if(element.count > 0){	// FULL PAGE OF RESULTS
							var nextItemIndex = $("#contents li").size();
							$.each(element.recipes, function(i, recipe){
								processRecipe(page, recipe);
							});
							$($("#contents li").get(nextItemIndex)).scrollView();
							
							$("#indicators").show();
							$("#load_more").show().button("enable");
						}
						else if(element.count <= 0){// NO RESULTS
							$("#contents").append($("<li class='center'><h2>NO RESULTS FOUND</h2><h5>Try modifying your search terms</h5><li>"));
						}
						if (element.count != 30) {	// LAST PAGE OF RESULTS
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


/*=================
   MISC FUNCTIONS
=================*/
/* AUTO SCROLL-TO FUNCTION */
$.fn.scrollView = function () {
	return this.each(function () {
		$('html, body').animate({
		scrollTop: $(this).offset().top
		}, 750);
	});
}