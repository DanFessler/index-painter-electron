import Vector2 from "./Vector";
import hermite from "cubic-hermite";

// This class makes a polyline CatmullRom spline with evenly spaced points.
// This allows us to get a point along the spline at a specified length.

export class CatmullRom {
  constructor(p0, p1, p2, p3) {
    this.points = [
      {
        pos: p1,
        tan: {
          x: (p2.x - p0.x) / 2,
          y: (p2.y - p0.y) / 2
        }
      },
      {
        pos: p2,
        tan: {
          x: (p3.x - p1.x) / 2,
          y: (p3.y - p1.y) / 2
        }
      }
    ];
  }

  smoothstep(a, b, t) {
    // Scale, bias and saturate x to 0..1 range
    t = Math.min(Math.max((t - a) / (b - a), 0.0), 1.0);
    // Evaluate polynomial
    return t * t * (3 - 2 * t);
  }

  getPointAtInterval(i) {
    let p = hermite(
      [this.points[0].pos.x, this.points[0].pos.y],
      [this.points[0].tan.x, this.points[0].tan.y],
      [this.points[1].pos.x, this.points[1].pos.y],
      [this.points[1].tan.x, this.points[1].tan.y],
      i
    );
    function lerp(start, end, amt) {
      return (1 - amt) * start + amt * end;
    }
    let z = this.smoothstep(
      0,
      1,
      lerp(this.points[0].pos.z, this.points[1].pos.z, i)
    );
    z = lerp(this.points[0].pos.z, this.points[1].pos.z, i);
    return { x: p[0], y: p[1], z: z };
  }
}

export class PolyCatmull {
  constructor(p0, p1, p2, p3, resolution, segmentLength) {
    this.spline = new CatmullRom(p0, p1, p2, p3);

    this.segmentLength = segmentLength
      ? segmentLength
      : this.calculateLength(resolution) / resolution;
    this.segments = this.makeLinear(resolution, this.segmentLength);
    this.lastSegmentLength = Vector2.distance(
      this.segments[this.segments.length - 2],
      this.segments[this.segments.length - 1]
    );
    this.length =
      (this.segments.length - 2) * this.segmentLength + this.lastSegmentLength;
  }

  calculateLength(resolution) {
    let lengthAcc = 0;
    let lastPoint = this.spline.getPointAtInterval(0);
    for (let i = 1; i <= resolution; i++) {
      let point = this.spline.getPointAtInterval(i / resolution);
      lengthAcc += Vector2.distance(point, lastPoint);
      lastPoint = point;
    }
    return lengthAcc;
  }

  makeLinear(resolution, segmentLength) {
    let lengthAcc = 0;
    let lastPoint = this.spline.getPointAtInterval(0);
    let segments = [lastPoint];

    for (let i = 1; i < resolution; i++) {
      let point = this.spline.getPointAtInterval(i / resolution);
      let segment = Vector2.subtract(point, lastPoint);

      let length = lengthAcc + segment.length();
      if (length >= segmentLength) {
        for (let i = 0; i < Math.floor(length / segmentLength); i++) {
          let vec = segment.normalize().multiply(segmentLength - lengthAcc);
          point = Vector2.add(lastPoint, vec);
          segments.push(point);
          lastPoint = point;
          lengthAcc = segment.length() - vec.length();
        }
      } else {
        lastPoint = point;
        lengthAcc += segment.length();
      }
    }
    segments.push(this.spline.getPointAtInterval(1));
    return segments;
  }

  smoothstep(a, b, t) {
    // Scale, bias and saturate x to 0..1 range
    t = Math.min(Math.max((t - a) / (b - a), 0.0), 1.0);
    // Evaluate polynomial
    return t * t * (3 - 2 * t);
  }

  getPointAtLength(length) {
    function lerp(start, end, amt) {
      return (1 - amt) * start + amt * end;
    }

    let i = Math.min(
      Math.floor(length / this.segmentLength),
      this.segments.length - 2
    );

    let point = Vector2.lerp(
      this.segments[i],
      this.segments[i + 1],
      i === this.segments.length - 2
        ? (length - i * this.segmentLength) / this.lastSegmentLength
        : (length - i * this.segmentLength) / this.segmentLength
    );

    // console.log(
    //   "LERP",
    //   this.spline.points[0].pos.z,
    //   this.spline.points[1].pos.z,
    //   length,
    //   this.length
    // );
    let z = lerp(
      this.spline.points[0].pos.z,
      this.spline.points[1].pos.z,
      length / this.length
    );
    return { ...point, z: z };
  }

  getPointAtInterval(i) {
    return this.getPointAtLength(i * this.length);
  }
}

export default PolyCatmull;
