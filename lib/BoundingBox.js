function BoundingBox() {

  var minX = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var minY = Infinity;

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

  this.toString = function() {
    return 'min: ' + minX + ',' + minY + ' max: ' + maxX + ',' + maxY;
  };

  this.expandByPoint = function(x, y) {
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

  this.expandByTranslatedBox = function(box, x, y) {
    this.expandByPoint(box.minX + x, box.maxY + y);
    this.expandByPoint(box.maxX + x, box.minY + y);
  };

  this.expandByBox = function(box) {
    this.expandByPoint(box.minX, box.maxY);
    this.expandByPoint(box.maxX, box.minY);
  };

}

module.exports = BoundingBox;
