'use strict';

const tripcore = require('trip.core');
const trip3 = require('trip.three');
const Controller = tripcore.Controller;

const DXFModel = require('./DXFModel');
const DXFView = require('./DXFView');

class DXFController extends Controller {

  constructor(contents, selector) {
    super(new DXFModel(contents));

    const scene = new trip3.Scene(selector, {});
    scene.setOrthoZPos();
    this.addView(scene, DXFView);
    setTimeout(() => {
      scene.zoomToExtents();
    });
  }

}

module.exports = DXFController;
