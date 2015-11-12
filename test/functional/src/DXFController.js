let trip = require('triptych');
let $ = trip.$;
let ThreeJSScene = trip.scenes.ThreeJSScene;
let Controller = trip.Controller;
let Model = trip.Model;

let DXFModel = require('./DXFModel');
let DXFView = require('./DXFView');

class DXFController extends Controller {

  constructor(contents, selector) {
    super(new DXFModel(contents));

    var threeJSSceneOptions = {
      cameraPosition: {
        x: 0, y: 0, z: 5,
      }
    };
    var threeJSScene = new ThreeJSScene($(selector), threeJSSceneOptions);
    this.addView(threeJSScene, DXFView);
  }

}

module.exports = DXFController;
