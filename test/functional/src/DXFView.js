'use strict';

const trip3 = require('trip.three');
const THREE = trip3.THREE;
const ThreeJSView = trip3.View;

class DXFView extends ThreeJSView {

  constructor(model, scene) {
    super(model, scene);
    this.material = new THREE.LineBasicMaterial({
      color: 0x000000,
    });
  }

  render() {
    this.model.polylines.forEach((polyline) => {
      const geometry = new THREE.Geometry();
      geometry.vertices = polyline.map((xy) => {
        return new THREE.Vector3(xy[0], xy[1], 0);
      });
      const line = new THREE.Line(geometry, this.material);
      this.sceneObject.add(line);
    });
  }

}

module.exports = DXFView;
