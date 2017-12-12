'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BoundingBox = function () {
  function BoundingBox() {
    _classCallCheck(this, BoundingBox);

    var minX = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minY = Infinity;

    Object.defineProperty(this, 'minX', {
      get: function get() {
        return minX;
      }
    });

    Object.defineProperty(this, 'maxX', {
      get: function get() {
        return maxX;
      }
    });

    Object.defineProperty(this, 'maxY', {
      get: function get() {
        return maxY;
      }
    });

    Object.defineProperty(this, 'minY', {
      get: function get() {
        return minY;
      }
    });

    Object.defineProperty(this, 'width', {
      get: function get() {
        return maxX - minX;
      }
    });

    Object.defineProperty(this, 'height', {
      get: function get() {
        return maxY - minY;
      }
    });

    this.expandByPoint = function (x, y) {
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

  _createClass(BoundingBox, [{
    key: 'toString',
    value: function toString() {
      return 'min: ' + this.minX + ',' + this.minY + ' max: ' + this.maxX + ',' + this.maxY;
    }
  }, {
    key: 'expandByTranslatedBox',
    value: function expandByTranslatedBox(box, x, y) {
      this.expandByPoint(box.minX + x, box.maxY + y);
      this.expandByPoint(box.maxX + x, box.minY + y);
    }
  }, {
    key: 'expandByBox',
    value: function expandByBox(box) {
      this.expandByPoint(box.minX, box.maxY);
      this.expandByPoint(box.maxX, box.minY);
    }
  }]);

  return BoundingBox;
}();

exports.default = BoundingBox;