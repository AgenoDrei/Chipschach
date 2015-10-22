var main = function() {
	adjustScreen();

	//control Size
	window.onresize = adjustScreen;

// relevant for Singleplayer
	$('#btn_sp_start').click(function(e) { // Start a Singelplayer Game
		e.preventDefault();
		$('#menu').hide();
		$('#help').hide();
		$('#showHelp').css({
			'box-shadow' : '0px 0px 0px #fff'
		});
		Game.reset();
		Game.start();
	});

	
// relevant for Multiplayer
	$('#btn_mp_start').click(function(e) { // Start a Multiplayer Game
		e.preventDefault();
		$('#menu').hide();
		$('#help').hide();
		$('#showHelp').css({
			'box-shadow' : '0px 0px 0px #fff'
		});
		Game.reset();
		Game.start();
	});

//relevant for menu Button
$('#btn_menu').click(function(e) {
	if($('#nav').css("left") == "-250px") {
		$('#overlay').fadeIn(200);
		$('#nav').animate({left: "0px"}, 200);
		$('#btn_menu').css("background", "url('../img/close_menu.png') no-repeat scroll center center / 75% 75% #FFF");
	} else {
		$('#overlay').fadeOut(200);
		$('#nav').animate({left: "-250px"}, 200);
		$('#btn_menu').css("background", "url('../img/menu.png') no-repeat scroll center center / 80% 80% #FFF");
	}
});

/*//releveant for menu swipe
$(window).on("swiperight", function() {
	if($('#nav').css("left") == "-250px") {
		$('#overlay').fadeIn(200);
		$('#nav').animate({left: "0px"}, 200);
		$('#btn_menu').css("background", "url('../img/close_menu.png') no-repeat scroll center center / 75% 75% #FFF");
	}
});

$(window).on("swipeleft", function() {
	if($('#nav').css("left") == "0px") {
		$('#overlay').fadeOut(200);
		$('#nav').animate({left: "-250px"}, 200);
		$('#btn_menu').css("background", "url('../img/menu.png') no-repeat scroll center center / 80% 80% #FFF");
	}
});*/



	$('#btn_difficulty').is(function() { // if there is a difficulty-Button (Beat on/off), diff -> 1 (0 is only used for Singleplayer!)
		Game.difficulty = 1;
	});
	$('#btn_difficulty').click(function(e) {	//toggles the difficulty-Button
		e.preventDefault();
		var btnClass = $('#btn_difficulty').attr('class');
		if (btnClass == 'btn btn-warning btn-lg') {
			$('#btn_difficulty').removeClass('btn btn-warning btn-lg');
			$('#btn_difficulty').addClass('btn btn-default btn-lg');
			$('#btn_difficulty').text('Schlagen ist aus');
			Game.difficulty = 1;
			Level.win = 0;
		} else if (btnClass == 'btn btn-default btn-lg') {
			$('#btn_difficulty').removeClass('btn btn-default btn-lg');
			$('#btn_difficulty').addClass('btn btn-warning btn-lg');
			$('#btn_difficulty').text('Schlagen ist an');
			Game.difficulty = 2;
			if(Level.win == 0) Level.win=2;
		}
	});
	
	url = window.location+'';	//catch whether the level is minischach and set the info-text accordingly
	url_pairs = url.split('=');
	level = url_pairs[1];
	if (level.search(/minischach.+/) != -1) {
		$('#btn_difficulty').click();
		$('#btn_difficulty').attr('disabled', 'disabled');
        $('#btn_nextLevel').hide();
		$('#help .row').hide();
		$('#help').hide();
		$('#showHelp').css({
			'box-shadow' : '0px 0px 0px #fff'
		});
	}
	
	
// Single- & Multiplayer
	// Load Desciption
	try {	
		$('#menu p').text(Level.description); 
		$('#menu h3').text(Level.name);
	} catch (e) {
		console.log(e);
		$('#start').hide();
	}
	
	$('#close').click(function() { // Back to menu
		window.location.href = "/menu";
	});

	$('#showHelp').click(function() { // Toggle the help bar + help-Button
		if ($('#help').is(":visible")) {
			$('#help').hide();
			$('#showHelp').css({
				'box-shadow' : '0px 0px 0px #fff'
			});
		} else if ($('#help').is(":hidden")) {
			$('.head-help .description').text(Level.description);
			$('.head-help p').show();
			$('.head-help_img').hide();
			$('#help').show();
			$('#showHelp').css({
				'box-shadow' : '0px 0px 20px orange'
			});
		}
	});

	//TODO testing
	$('#btn_nextLevel').click(function() {
		var url = window.location + ''; // +'' , because ... reasons. Won't work otherwise...
		var level_pairs = url.split('='); // level[0] = '.../multiplayer.html?level', level[1] = 'mp_l_tower_01
		var modus_pairs = level_pairs[0].split('/local/');
		var level = level_pairs[1];		// e.g.: 'mp_l_tower_01'
		var modus = modus_pairs[0];		// e.g.: 'multiplayer.html?level'
		modus += "=";				// => '....html?level='



		var levelNum1 = parseInt(level[level.length - 1]);
		var levelNum2= parseInt(level[level.length-3]);
		levelNum1++;

		var newLevel = '';
		for (var i = 0; i < level.length - 3; i++)	// delete last 2 numbers
			newLevel += level[i];

		newLevel+= (levelNum2);
		newLevel+= "_";
		newLevel+= levelNum1;

		$.getScript("level/"+newLevel) 
		.fail(function( jqxhr, settings, exception ) {
			newLevel = newLevel.replaceAt(newLevel.length-1, "1");
			levelNum2++;
			newLevel = newLevel.replaceAt(newLevel.length-3, levelNum2);
			console.log(newLevel, levelNum2);
			$.getScript("level/" + newLevel)
			.fail(function( jqxhr, settings, exception ) {
				alert("Es gibt kein neues Level!")
				return;
			})
			.done(function(){
				window.location.href = modus + newLevel;
			});
		})
		.done(function(){
			window.location.href = modus + newLevel;
		});
	});
	

	// Singleplayer undoButton
	$('#undo').mouseover(function() {
		if (Game.lastTurn.avaible) { // Only when Crafty is up
			$('#undo').css({
				'box-shadow' : '0px 0px 20px orange'
			});
			Game.showLastTurn(true);
		}
	});
	$('#undo').mouseleave(function() {
		if (Game.lastTurn.avaible) { // Only when Crafty is up
			$('#undo').css({
				'box-shadow' : '0px 0px 0px #fff'
			});
			Game.showLastTurn(false);
		}
	});
	$('#undo').click(function() {
		if(Game.lastTurn.avaible) {
			Game.undo();
			toastr.info('Zug wurde zurückgenommen')
			Game.showLastTurn(false);
			$('#moveCounter_value').text(Game.turns);
			$('#chipCounter_value').text(Win.killedChips.yellow + Win.killedGreenChips.yellow);
			$('#undo').css({
				'box-shadow' : '0px 0px 0px #fff'
			});
		} else if(Crafty.stage == undefined) {
		} else {
			toastr.warning('Du kannst nur einen Zug zurücknehmen!')
		}
	});

	//Local Multiplayer yield button
	$('#yield').click(function() {
		if(Crafty.stage != undefined)
			Game.win(Game.getEnemy(), Game.translate(Game.playerTurn) + ' hat aufgegeben!');
	});
	

}
$.getScript(Game.getLevelPath())
.done(function(){
	console.log('DEBUG> Level '+ Game.getLevelPath() +' loaded!');
	$(document).ready(main);
})
.fail(function( jqxhr, settings, exception ) {
	console.log("Error ", exception);
	$(document).ready(main);
});

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

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+1);
}