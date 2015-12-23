CanvasHandler = {
  canvas: null,
  ctx: null,

  createCanvas: function(anchor, w, h) {
    CanvasHandler.canvas = document.createElement('canvas');
    CanvasHandler.canvas.id = "made by a tool";
    anchor.appendChild(CanvasHandler.canvas);

    CanvasHandler.canvas.height = h;
    CanvasHandler.canvas.width = w;

    CanvasHandler.ctx = CanvasHandler.canvas.getContext('2d');
  },

  loadAssets : function(path) {

  },

  testScribble: function() {
    var ctx = CanvasHandler.ctx;
    ctx.beginPath();
    ctx.rect(20, 40, 50, 50);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(240, 160, 20, 0, Math.PI * 2, false);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.rect(260, 250, 100, 40);
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.stroke();
    ctx.closePath();
  }
}
