import React from "react";
import css from "./css/BrushCursor.module.css";

function BrushCursor({ brush, canvas, mousePos }) {
  const outerSize = brush.size * canvas.zoom;
  const innerSize = Math.min(
    brush.size * (brush.hardness / 100) * canvas.zoom,
    outerSize - 1
  );
  return [
    <div
      className={css.circle}
      key={0}
      style={{
        width: outerSize,
        height: outerSize,
        borderRadius: outerSize,
        top: mousePos.y - outerSize / 2,
        left: mousePos.x - outerSize / 2,
        padding: outerSize / 2
      }}
    ></div>,
    <div
      className={css.circle}
      key={1}
      style={{
        width: innerSize,
        height: innerSize,
        borderRadius: innerSize,
        top: mousePos.y - innerSize / 2,
        left: mousePos.x - innerSize / 2,
        padding: innerSize / 2
      }}
    ></div>
  ];
}

export default BrushCursor;
