CanvasHandler = {
  canvas: null,
  ctx: null,
  fieldSize : -1,

  createCanvas: function(anchor, w, h) {
    CanvasHandler.canvas = document.createElement('canvas');
    CanvasHandler.canvas.id = "made by a tool";
    anchor.appendChild(CanvasHandler.canvas);

    CanvasHandler.canvas.height = h;
    CanvasHandler.canvas.width = w;

    CanvasHandler.ctx = CanvasHandler.canvas.getContext('2d');
    CanvasHandler.canvas.style.background = 'black url("img/board.png") no-repeat scroll 0 0 / cover';

    var boardOffset = CanvasHandler.calcDimensions(w, h);

    CanvasHandler.ctx.translate(boardOffset, boardOffset);
    CanvasHandler.testScribble();

  },

  calcDimensions : function(width, height) {
    var ratio = width / Engin.MAX_WIDTH;
    var boardOffset = ratio * 40;

    CanvasHandler.fieldSize = ratio * ((Engin.MAX_WIDTH - 2 * boardOffset)/8); //Chess has 8 fields

    return boardOffset;
  },

  loadAssets : function(path) {
    //ToDo
    //Load Spritemap and save them in array
  },

  testScribble: function() {
    var ctx = CanvasHandler.ctx;
    ctx.beginPath();
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(560, 560);
    ctx.stroke();
    ctx.closePath();
  }
}
