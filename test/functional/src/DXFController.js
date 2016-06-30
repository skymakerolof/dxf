let trip = require('triptych');
let $ = trip.$;
let ThreeJSScene = trip.scenes.ThreeJSScene;
let Controller = trip.Controller;

let DXFModel = require('./DXFModel');
let DXFView = require('./DXFView');

class DXFController extends Controller {

  constructor(contents, selector) {
    super(new DXFModel(contents));

    var threeJSSceneOptions = {
      cameraPosition: {
        x: 0,
        y: 0,
        z: 5,
      },
      cameraUp: {
        x: 0,
        y: 1,
        z: 0,
      },
      disableRotate: true,
    };
    var threeJSScene = new ThreeJSScene($(selector), threeJSSceneOptions);
    this.addView(threeJSScene, DXFView);
    setTimeout(() => {
      threeJSScene.zoomTo2DExtents();
    });
  }

}

module.exports = DXFController;
