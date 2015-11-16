let trip = require('triptych');
let THREE = trip.THREE;
let ThreeJSView = trip.views.ThreeJSView;

class DXFView extends ThreeJSView {

  constructor(model, scene) {
    super(model, scene);
    this.material = new THREE.LineBasicMaterial({
      color: 0x000000,
    });
  }

  render() {
    this.model.polylines.forEach((polyline) => {
      var geometry = new THREE.Geometry();
      geometry.vertices = polyline.map((xy) => {
        return new THREE.Vector3(xy[0], xy[1], 0);
      });
      var line = new THREE.Line(geometry, this.material);
      this.sceneObject.add(line);
    });
  }

}

module.exports = DXFView;
