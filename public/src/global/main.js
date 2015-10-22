//var URL = $("#address").val();
var PORT = 3001;
var HOST = 'ws://localhost:'+PORT;
var MODUS = '';
var NAMEID = '';
var LEVEL = '';

var main = function() {
//Start Game
if (window.innerWidth > 900 && $('#nav').css("left") == "-250px") {
		$('#nav').css("left", "0px");
		$('#board-container').css("left", "250px");
		$('#btn_menu').hide();
} else if(window.innerWidth <= 900 && $('#nav').css("left") == "0px"){
		$('#nav').css("left", "-250px");
		$('#board-container').css("left", "0px");
		$('#btn_menu').show();
}

if(MODUS == "create") {
	$('#btn_mp_start').hide();
	$('#btn_difficulty').hide();
	$('#menu p').hide();
	$('.spinner').show();
	try {
		connect(HOST, "1", NAMEID, LEVEL);
	} catch(e) {}
} else if(MODUS == "join") {
	$('#menu').hide();
	try {
		connect(HOST, "2", NAMEID, LEVEL);
	} catch(e) {}
}

//relevant for menu Button
$('#btn_menu').click(function(e) {
	if($('#nav').css("left") == "-250px") {
		$('#overlay').fadeIn(200);
		$('#nav').animate({left: "0px"}, 200);
		$('#btn_menu').css("background", "url('../../img/close_menu.png') no-repeat scroll center center / 75% 75% #FFF");
	} else {
		$('#overlay').fadeOut(200);
		$('#nav').animate({left: "-250px"}, 200);
		$('#btn_menu').css("background", "url('../../img/menu.png') no-repeat scroll center center / 80% 80% #FFF");
	}
});

	// Start a Multiplayer Game and connect to Server
	$('#btn_mp_start').click(function(e) { 
		e.preventDefault();
		//$('#menu').hide();
		$('#help').hide();
		$('#showHelp').css({
			'box-shadow' : '0px 0px 0px #fff'
		});
		if($('#btn_mp_start').text() == 'Restart') {
			try {
				connection.close();
			} catch(e) {}
		}
		
		try {
			//start a game and try to connect to the server
			connect("ws://"+$('#address').val()+":"+PORT);
			send('KEKSE'); //just a test
		} catch(e) {
			//Crafty.stop();
		}
	});
	
	/*
	 * Wont happen the button is disabled, but maybe you will change that
	 */
	$('#btn_difficulty').is(function() { // Change game difficulty
		Game.difficulty = 1;
	});
	
	//Switching the game difficulty
	$('#btn_difficulty').click(function(e) {
		e.preventDefault();
		var btnClass = $('#btn_difficulty').attr('class');
		if (btnClass == 'btn btn-warning btn-lg') {
			$('#btn_difficulty').removeClass('btn btn-warning btn-lg');
			$('#btn_difficulty').addClass('btn btn-default btn-lg');
			$('#btn_difficulty').text('Schlagen verboten');
			Game.difficulty = 1;
		} else if (btnClass == 'btn btn-default btn-lg') {
			$('#btn_difficulty').removeClass('btn btn-default btn-lg');
			$('#btn_difficulty').addClass('btn btn-warning btn-lg');
			$('#btn_difficulty').text('Schlagen erlaubt');
			Game.difficulty = 2;
		}
	});

	/*//Multiplayer Help
	$('#showHelp').click(function() { // Toggle of the help bar
		if ($('#help').is(":visible")) {
			$('#help').hide();
			$('#showHelp').css({
				'box-shadow' : '0px 0px 0px #fff'
			});
		} else if ($('#help').is(":hidden")) {
			//$('.head-help .description').text(Level.description);
			$('.head-help p').show();
			$('.head-help_img').hide();
			$('#help').show();
			$('#showHelp').css({
				'box-shadow' : '0px 0px 20px orange'
			});
		}
	});*/

	$('#close').click(function() { // Back to menu
		window.location.href = "menu";
	});
	
	//Blending out the help at start
	$('#btn_difficulty').click();
	$('#btn_difficulty').attr('disabled', 'disabled');
	$('#help .row').hide();
	$('#help').hide();
	$('#showHelp').css({
		'box-shadow' : '0px 0px 0px #fff'
	});
	
	//Global Multiplayer yield button
	$('#yield').click(function() {
		if(Crafty.stage != undefined)
			send('{"type" : "yield"}');
	});

	//control Size
	window.onresize = adjustScreen;
	Game.reset();
	Game.start();

}

$(document).ready(function() {
	//Getting the get parameter from the url
	var query = window.location.search.substring(1);
	var pairs = query.split('&');
	if (pairs.length > 3 || pairs.length < 3) {
		console.log("Please only three parameter!")
		return undefined;
	}
	//Split get parameter in key and value, e.g. level : sp_tower_1
	var pair1 = pairs[0].split('=');
	var pair2 = pairs[1].split('=');
    var pair3 = pairs[2].split('=');
    
	if (pair1[0] == "modi" && pair2[0] == "name" && pair3[0] == 'level') {
        if (pair1[1].length > 0 && pair2[1].length > 0 && pair3[1].length > 0) {
			MODUS = pair1[1];
			NAMEID = decodeURIComponent(pair2[1]);
            LEVEL = decodeURIComponent(pair3[1]);
            main();
        }
	} else {
		console.log("Please enter all three parameters!");
		return undefined;
	}   
}); //Will be executed when the html file is loaded

function adjustScreen(event) {
	if (window.innerWidth > 900 && $('#nav').css("left") == "-250px") {
		$('#nav').css("left", "0px");
		$('#board-container').css("left", "250px");
		$('#btn_menu').hide();
	} else if(window.innerWidth <= 900 && $('#nav').css("left") == "0px"){
		$('#nav').css("left", "-250px");
		$('#board-container').css("left", "0px");
		$('#btn_menu').show();
	}
}
