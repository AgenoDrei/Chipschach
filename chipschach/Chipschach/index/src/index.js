var main = function() {
	window.location.href = "index/menu.html";

	//control Size
	window.onresize = function(event) {
	};
	
	$('#btn_login').click(function(){
		var hash = CryptoJS.MD5($('#pw').val()).toString();
		if (hash == "73abb7de8046721571a2d4fb5c7723be") {
			$('#userdata').fadeOut(250);
			$('#logo_center').fadeOut(400);
			
			setTimeout(function() {
				window.location.replace("index/menu.html")
			}, 350);
		} else {
			window.alert("Passwort ist leider falsch")
		}
		
		
	});

}

$(document).ready(main);