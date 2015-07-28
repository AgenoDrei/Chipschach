var main = function() {
	//window.location.href = "index/menu.html";

	
	$('#btn_login').click(function(){
		var hash = CryptoJS.MD5($('#pw').val()).toString();
		if (hash == "73abb7de8046721571a2d4fb5c7723be") {
			$('#userdata').fadeOut(250);
			$('#logo_center').fadeOut(400);
			
			setTimeout(function() {
				window.location.replace("menu")
			}, 350);
		} else {
			window.alert("Passwort ist leider falsch")
		}
		
		
	});

}

$(document).ready(main);
