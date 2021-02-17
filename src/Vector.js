/*
Simple 2D JavaScript Vector Class
Hacked from evanw's lightgl.js
https://github.com/evanw/lightgl.js/blob/master/src/vector.js
*/

function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

/* INSTANCE METHODS */

Vector.prototype = {
  negative: function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  },
  add: function(v) {
    if (v instanceof Vector) {
      this.x += v.x;
      this.y += v.y;
    } else {
      this.x += v;
      this.y += v;
    }
    return this;
  },
  subtract: function(v) {
    if (v instanceof Vector) {
      this.x -= v.x;
      this.y -= v.y;
    } else {
      this.x -= v;
      this.y -= v;
    }
    return this;
  },
  multiply: function(v) {
    if (v instanceof Vector) {
      this.x *= v.x;
      this.y *= v.y;
    } else {
      this.x *= v;
      this.y *= v;
    }
    return this;
  },
  divide: function(v) {
    if (v instanceof Vector) {
      if (v.x !== 0) this.x /= v.x;
      if (v.y !== 0) this.y /= v.y;
    } else {
      if (v !== 0) {
        this.x /= v;
        this.y /= v;
      }
    }
    return this;
  },
  equals: function(v) {
    return this.x === v.x && this.y === v.y;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y;
  },
  cross: function(v) {
    return this.x * v.y - this.y * v.x;
  },
  length: function() {
    return Math.sqrt(this.dot(this));
  },
  normalize: function() {
    return this.divide(this.length());
  },
  min: function() {
    return Math.min(this.x, this.y);
  },
  max: function() {
    return Math.max(this.x, this.y);
  },
  toAngles: function() {
    return -Math.atan2(-this.y, this.x);
  },
  angleTo: function(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  },
  toArray: function(n) {
    return [this.x, this.y].slice(0, n || 2);
  },
  clone: function() {
    return new Vector(this.x, this.y);
  },
  set: function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
};

/* STATIC METHODS */
Vector.negative = function(v) {
  return new Vector(-v.x, -v.y);
};
Vector.add = function(a, b) {
  if (typeof b === "number") return new Vector(a.x + b, a.y + b);
  else return new Vector(a.x + b.x, a.y + b.y);
};
Vector.subtract = function(a, b) {
  if (typeof b === "number") return new Vector(a.x - b, a.y - b);
  else return new Vector(a.x - b.x, a.y - b.y);
};
Vector.multiply = function(a, b) {
  if (typeof b === "number") return new Vector(a.x * b, a.y * b);
  else return new Vector(a.x * b.x, a.y * b.y);
};
Vector.divide = function(a, b) {
  if (typeof b === "number") return new Vector(a.x / b, a.y / b);
  else return new Vector(a.x / b.x, a.y / b.y);
};
Vector.equals = function(a, b) {
  return a.x === b.x && a.y === b.y;
};
Vector.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};
Vector.cross = function(a, b) {
  return a.x * b.y - a.y * b.x;
};
Vector.distance = function(a, b) {
  return Vector.subtract(a, b).length();
};
Vector.lerp = function(a, b, t) {
  return new Vector(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
};

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

export default Vector;
