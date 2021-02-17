import React from "react";
import css from "./css/ToolBar.module.css";
import { TOOLS } from "../constants.js";

// Icons
import * as icons from "../icons";

function ToolBar({ selected, dispatch, undo, redo }) {
  const tools = [
    { id: TOOLS.Brush, icon: icons.BrushIcon, name: "Brush" },
    // { id: TOOLS.Pencil, icon: icons.PencilIcon, name: "Pencil" },
    // { id: TOOLS.Eraser, icon: icons.EraserIcon, name: "Eraser" },
    // { id: TOOLS.Dither, icon: icons.DitherIcon, name: "Dither" },
    // { id: TOOLS.SelectRect, icon: icons.SelectRectIcon, name: "Select Rect" },
    { id: TOOLS.Pan, icon: icons.HandIcon, name: "Pan" },
    // { id: TOOLS.Line, icon: icons.LineIcon, name: "Line" },
    // { id: TOOLS.Fill, icon: icons.BucketIcon, name: "Fill" },
    { id: TOOLS.Eyedropper, icon: icons.EyedropperIcon, name: "Eyedropper" },
    { id: TOOLS.Zoom, icon: icons.ZoomIcon, name: "Zoom" }
  ];
  return (
    <div className={css.container}>
      <div className={css.tools}>
        {tools.map((tool, i) => {
          return (
            <Button
              key={i}
              icon={tool.icon}
              selected={selected === tool.id}
              name={tool.name}
              onClick={() => dispatch({ type: "TOOL_SELECT", value: tool.id })}
              marginBottom={i === tools.length - 1 ? 0 : 4}
            />
          );
        })}
      </div>
    </div>
  );
}

function Button({
  marginRight,
  marginBottom,
  icon,
  v,
  selected,
  onClick,
  name
}) {
  let IconComponent = icon;
  return (
    <div
      className={`button ${css.button} ${selected ? "selected" : ""}`}
      style={{
        marginBottom: marginBottom,
        marginRight: marginRight
      }}
      onClick={onClick}
    >
      <IconComponent
        style={{
          fill: "white"
        }}
        v={v ? v : 0}
      />
    </div>
  );
}

export default ToolBar;
