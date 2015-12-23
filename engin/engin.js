Engin = {
  WIDTH : -1,
  HEIGHT : -1,
  DEBUG : true,

  parent : null,
  canvasHandler : CanvasHandler,

  init : function(width, height, container) {
    Engin.WIDTH = width;
    Engin.HEIGHT = height;

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
    Engin.parent.style.background = "rgba(0,0,0,0.2)";

    CanvasHandler.createCanvas(Engin.parent, Engin.WIDTH, Engin.HEIGHT);
    CanvasHandler.loadAssets("assest");

    if(Engin.DEBUG) console.log("ENGIN> Initialization successfull!");
  }
}
