import React from "react";

import css from "./css/InputButton.module.css";

function InputButton(props) {
  return (
    <div className={css.propertyControl} title={props.name}>
      <div
        onClick={props.onClick}
        style={props.style}
        className={`button ${props.selected ? "selected" : ""}`}
      >
        {props.icon ? props.icon : props.name}
      </div>
    </div>
  );
}

export default InputButton;
