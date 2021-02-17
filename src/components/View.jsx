import React, { useRef, useEffect } from "react";

import css from "./css/View.module.css";

function View({ canvas, position, zoom }) {
  const canvasRef = useRef();

  useEffect(() => {
    canvas.addView(canvasRef.current.getContext("2d"));
    canvas.draw();

    return () => canvas.removeView(canvasRef.current.getContext("2d"));
  }, [canvas]);

  return (
    <canvas
      className={css.canvasDiv}
      ref={canvasRef}
      width={canvas.size.x}
      height={canvas.size.y}
      style={{
        width: `${canvas.renderer.domElement.width * zoom}px`,
        height: `${canvas.renderer.domElement.height * zoom}px`,
        left: `${position.x - (canvas.renderer.domElement.width * zoom) / 2}px`,
        top: `${position.y - (canvas.renderer.domElement.height * zoom) / 2}px`,
        position: "absolute"
        // transform: `scale(${zoom})`
      }}
    ></canvas>
  );
}

export default View;
