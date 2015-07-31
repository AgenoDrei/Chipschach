//var URL = $("#address").val();
var PORT = 3001;

var main = function() {
	//Try to grab the level list from the server
	try { //Hello someone there?
		//connectToLevelServer('ws://'+URL+':'+PORT);
		//sendText('Hallo');
	} catch(e) { //Nope nobody at home
		//console.log(e.message);
	}
	
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

$(document).ready(main); //Will be executed when the html file is loaded

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
