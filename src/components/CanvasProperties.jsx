import React from "react";
import InputButton from "./InputButton.jsx";

CanvasProperties.defaultProps = {
  id: "canvasProperites",
  title: "PROPERTIES"
};

function CanvasProperties({ dispatch, canvas, title }) {
  return (
    <div style={{ padding: 8 }}>
      <InputButton
        name="Index Canvas"
        onClick={() => {
          console.log(canvas.canvas.drawIndexed);
          dispatch({
            type: "TOGGLE_INDEX",
            value: !canvas.canvas.drawIndexed
          });
        }}
        selected={canvas.canvas.drawIndexed}
      />
    </div>
  );
}

export default CanvasProperties;
