$(document).ready(function(){
	$(".grower").css("font-size", "40em");
	$(".delay-2s").css("color", "black");
	$(".delay-3s").css("color", "black");			
	$(".delay-3_5s").css("color", "blue").delay(4000).queue(function(next){
			$(this).addClass("flipper", function(){
				$(this).removeClass("flipped");
			});
			next();
		}
	);
	$(".delay-4s").css("color", "black");
	$(".delay-4_5s").css("color", "black").delay(5500).queue(function(next){
			$("#wrapper").fadeOut().parent().css('background', 'white').queue(function(next2){
				setTimeout(function(){
					window.location.replace("appTest.html");
				}, 500);
				next2();
			});
			next();
		}
	);
});