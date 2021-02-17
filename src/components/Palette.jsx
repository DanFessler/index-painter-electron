import React from "react";
import { PaletteIcon, PlusIcon } from "../icons";
import css from "./css/Palette.module.css";

class Palette extends React.Component {
  // return <div className={css.palettePanel}>{palette}</div>;
  static defaultProps = {
    id: "palette",
    title: "Palette"
  };

  handleSelect = i => {
    this.props.dispatch({
      type: "SET_SELECTED_COLOR",
      value: i
    });
  };

  render() {
    let { palette, selected, onSelect } = this.props;
    return (
      <div className={css.palettePanel}>
        <PaletteIcon
          style={{
            fill: "white",
            height: "100%",
            width: 22,
            margin: "0 8px",
            padding: 2
          }}
        />
        <div className={css.paletteContainer}>
          {palette.map((index, i) => (
            <div
              key={i}
              className={`${css.paletteIndex} ${
                i === selected ? css.selected : ""
              }`}
              style={{
                backgroundColor: `RGB(${index.join(",")})`
                // border: i === selected ? "1px solid black" : "none",
                // boxShadow:
                //   i === selected
                //     ? "0 0 1px white inset, 0 0 1px white inset, 0 0 1px white inset, 0 0 1px white inset"
                //     : "none"
              }}
              onClick={() => this.handleSelect(i)}
            />
          ))}
        </div>
        <PlusIcon
          style={{
            fill: "white",
            height: "100%",
            width: 22,
            margin: "0 8px",
            padding: 2
          }}
        />
      </div>
    );
  }
}
export default Palette;
