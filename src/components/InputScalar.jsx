import React, { useEffect, useState } from "react";

import css from "./css/InputScalar.module.css";

function InputScalar(props) {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onPointerUp(e) {
      setDragging(false);
      document.exitPointerLock();
    }

    function onPointerMove(e) {
      e.preventDefault();
      props.onChange(
        Math.min(Math.max(props.value + e.movementX, props.min), props.max)
      );
    }
    if (dragging) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }
  }, [props.value, dragging, props]);

  function handleChange(e) {
    console.log("CHANGING");
    props.onChange(Math.min(Math.max(e.target.value, props.min), props.max));
  }

  return (
    <div className={css.propertyControl}>
      <div
        className={css.label}
        onPointerDown={e => {
          e.preventDefault();
          setDragging(true);
          e.target.requestPointerLock();
        }}
      >
        {props.name}:
      </div>

      <div style={{ position: "relative", height: 26 }}>
        <input
          type="text"
          className={css.input}
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
          value={props.value}
          onChange={handleChange}
          onClick={e => {
            e.target.select();
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 16,
            // height: "100%",
            lineHeight: "26px",
            top: 0,
            right: 8,
            color: "gray",
            pointerEvents: "none"
          }}
        >
          {props.unit}
        </div>
      </div>
    </div>
  );
}

export default InputScalar;
