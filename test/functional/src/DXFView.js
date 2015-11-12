let trip = require('triptych');
let THREE = trip.THREE;
let ThreeJSView = trip.views.ThreeJSView;

class DXFView extends ThreeJSView {

  constructor(model, scene) {
    super(model, scene);
  }

  render() {
    var mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({color: 0xff0000}));
    this.sceneObject.add(mesh);
  }

}

module.exports = DXFView;
