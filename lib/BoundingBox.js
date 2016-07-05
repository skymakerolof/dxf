'use strict';

class BoundingBox {

  constructor() {
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minY = Infinity;

    Object.defineProperty(this, 'minX', {
      get: function() {
        return minX;
      }
    });

    Object.defineProperty(this, 'maxX', {
      get: function() {
        return maxX;
      }
    });

    Object.defineProperty(this, 'maxY', {
      get: function() {
        return maxY;
      }
    });

    Object.defineProperty(this, 'minY', {
      get: function() {
        return minY;
      }
    });

    Object.defineProperty(this, 'width', {
      get: function() {
        return maxX - minX;
      }
    });

    Object.defineProperty(this, 'height', {
      get: function() {
        return maxY - minY;
      }
    });

    this.expandByPoint= (x, y) => {
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (y > maxY) {
        maxY = y;
      }
    };

  }

  toString() {
    return 'min: ' + this.minX + ',' + this.minY + ' max: ' + this.maxX + ',' + this.maxY;
  }

  expandByTranslatedBox(box, x, y) {
    this.expandByPoint(box.minX + x, box.maxY + y);
    this.expandByPoint(box.maxX + x, box.minY + y);
  }

  expandByBox(box) {
    this.expandByPoint(box.minX, box.maxY);
    this.expandByPoint(box.maxX, box.minY);
  }

}

module.exports = BoundingBox;
