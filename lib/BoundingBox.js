function BoundingBox() {

  var left = Infinity;
  var right = -Infinity;
  var top = -Infinity;
  var bottom = Infinity;

  Object.defineProperty(this, 'left', {
    get: function() {
      return left;
    }
  });

  Object.defineProperty(this, 'right', {
    get: function() {
      return right;
    }
  });

  Object.defineProperty(this, 'top', {
    get: function() {
      return top;
    }
  });

  Object.defineProperty(this, 'bottom', {
    get: function() {
      return bottom;
    }
  });

  this.expandByPoint = function(x, y) {
    if (x < left) {
      left = x;
    }
    if (x > right) {
      right = x;
    }
    if (y < bottom) {
      bottom = y;
    }
    if (y > top) {
      top = y;
    }
  };

}

module.exports = BoundingBox;
