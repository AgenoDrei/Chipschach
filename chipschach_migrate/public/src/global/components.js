//Chessboard
// plus function at for positioning
Crafty.c('Grid', {
	init : function() { //Will be initated with width, height and z index
		this.attr({
			w : Game.map_grid.tile.width,
			h : Game.map_grid.tile.height,
			z : 2
		});
	},
	/*
	 * function to create component a board pos
	 */
	at : function(x, y) {
		if (x === undefined && y === undefined) {
			return {
				x : this.x / Game.map_grid.tile.width,
				y : this.y / Game.map_grid.tile.height
			};
		} else {
			this.attr({
				x : x * Game.map_grid.tile.width,
				y : y * Game.map_grid.tile.height
			});
			return this;
		}
	}

});

/*
 * Field Component (not used!!!)
 * 
 * supports 2D, Canvas, Grid, Color
 * 
 * see Crafty tutorials in the wiki
 */
Crafty.c('Field', {
	init : function() {
		this.requires('2D, Canvas, Grid, Color');
		this.color('rgba(200, 50, 50, 0.2)');
	}
});

/*
 * Component for Players and Chips
 */
Crafty.c('Figure', {
	init : function() {
		this.requires('2D, Canvas, Grid');
	}
});

/*
 * Definition of the component Player Figure
 * represents Chips and Figures
 */
Crafty.c('PlayerFigure', {
	init : function() {
		this.requires('Figure, Color');
		this.color('rgba(0, 255, 0, 0.0)'); //Can be colored if wanted

		this.bind('setColor', function(data) { //Trigger to color a special field
			if (this.x == Math.round(data.x * Game.map_grid.tile.width) && this.y == Math.round(data.y * Game.map_grid.tile.width)) {
				this.color(data.color)
			}
		})
		this.bind('kill_figure', function(data) { //Trigger to destroy a special figure e.g. if it is beaten
			if (this.x == (data.x * Game.map_grid.tile.width) && this.y == (data.y * Game.map_grid.tile.width)) {
				this.destroy();
			}
		});
	},
	type : 'none',	//type of the Figure e.g. "Tower", "Pawn", "Chip"
	player : 'none', //color of the Figure e.g. "yellow", "blue"
});

// TODO

