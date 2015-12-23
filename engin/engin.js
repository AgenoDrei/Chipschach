Engin = {
  WIDTH : -1,
  HEIGHT : -1,
  MAX_HEIGHT: 640,
  MAX_WIDTH: 640,
  DEBUG : true,

  board :

  parent : null,
  canvasHandler : CanvasHandler,

  init : function(width, height, container) {
    Engin.WIDTH = (width<=Engin.MAX_WIDTH) ? width : Engin.MAX_WIDTH;
    Engin.HEIGHT = (height <= Engin.MAX_HEIGHT) ? height : Engin.MAX_HEIGHT;

    if(container[0] != undefined || cotainer[0] != null)
      container = container[0];
    if(container == undefined || container == null || container.id != "canvasContainer" || container.constructor != HTMLDivElement) {
        console.log("ENGIN> Invalid container, Initialization failed");
        return;
    }
    Engin.parent = container;

    Engin.parent.style.height = Engin.HEIGHT;
    Engin.parent.style.width = Engin.WIDTH;
    Engin.parent.style.padding = "0px";
    Engin.parent.style.border = "0px";

    CanvasHandler.createCanvas(Engin.parent, Engin.WIDTH, Engin.HEIGHT);
    CanvasHandler.loadAssets("assest");

    if(Engin.DEBUG) console.log("ENGIN> Initialization successfull!");
  }
}
