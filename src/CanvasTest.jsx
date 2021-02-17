import React, { useRef, useEffect } from "react";
import PolyCatmull, { CatmullRom } from "./CatmullRom.js";

const points = [
  { x: 0, y: 0 },
  { x: 80, y: 240 },
  { x: 400, y: 240 },
  { x: 480, y: 480 }
];

let resolution = 16;
let spline = new CatmullRom(points[0], points[1], points[2], points[3]);
let polySpline = new PolyCatmull(
  points[0],
  points[1],
  points[2],
  points[3],
  resolution
);
console.log("LENGTH", polySpline.length);
console.log(polySpline.segments);

function App() {
  const ref = useRef(null);
  const size = { x: 480, y: 480 };

  useEffect(() => {
    const ctx = ref.current.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size.x, size.y);

    // Input points
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "white";
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 768);
    ctx.moveTo(polySpline.segments[0].x, polySpline.segments[0].y);
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
      // ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
    });
    ctx.stroke();
    ctx.closePath();

    // polySpline segments
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.moveTo(polySpline.segments[0].x, polySpline.segments[0].y);
    polySpline.segments.forEach(point => {
      ctx.lineTo(point.x, point.y);
      ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
    });
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "cyan";
    ctx.fillStyle = "white";

    // real spline interval
    ctx.moveTo(polySpline.segments[0].x, polySpline.segments[0].y + 40);
    for (let i = 0; i <= resolution; i++) {
      let point = spline.getPointAtInterval(i / resolution);
      ctx.lineTo(point.x, point.y + 40);
      ctx.fillRect(point.x - 2, point.y + 40 - 2, 4, 4);
    }

    // poly spline interval
    ctx.moveTo(polySpline.segments[0].x, polySpline.segments[0].y + 80);
    for (let i = 0; i <= resolution; i++) {
      let point = polySpline.getPointAtInterval(i / resolution);
      ctx.lineTo(point.x, point.y + 80);
      ctx.fillRect(point.x - 2, point.y + 80 - 2, 4, 4);
    }

    // point at specified length on polySpline
    ctx.moveTo(polySpline.segments[0].x, polySpline.segments[0].y + 120);
    for (let i = 0; i <= polySpline.length; i += 30) {
      let point = polySpline.getPointAtLength(i);
      ctx.lineTo(point.x, point.y + 120);
      ctx.fillRect(point.x - 2, point.y + 120 - 2, 4, 4);
    }
    let point = polySpline.getPointAtLength(polySpline.length);
    ctx.lineTo(point.x, point.y + 120);

    ctx.stroke();
    ctx.closePath();
  }, [size.x, size.y]);

  return <canvas width={size.x} height={size.y} ref={ref}></canvas>;
}

export default App;
