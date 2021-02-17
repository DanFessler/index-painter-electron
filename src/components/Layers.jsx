import React from "react";
import css from "./css/Layers.module.css";

import { EyeIcon } from "../icons";

class LayerTest extends React.Component {
  static defaultProps = {
    id: "layers",
    title: "Layers"
  };

  state = {
    layers: [
      { name: "My layer name 1", thumbnail: null, visible: true },
      { name: "My layer name 2", thumbnail: null, visible: false },
      { name: "My layer name 3", thumbnail: null, visible: true },
      { name: "My layer name 4", thumbnail: null, visible: false },
      { name: "My layer name 5", thumbnail: null, visible: false }
    ],
    selected: 0
  };

  render() {
    return (
      <Layers
        layers={this.state.layers}
        selected={this.state.selected}
        onSelect={i => this.setState({ selected: i })}
        onVisibilityToggle={i => {
          let layers = [...this.state.layers];
          layers[i].visible = !layers[i].visible;
          this.setState({ layers });
        }}
      />
    );
  }
}

class Layers extends React.Component {
  static defaultProps = {
    id: "layers",
    title: "Layers",
    layers: [],
    selected: null
  };
  render() {
    return (
      <div className={css.container}>
        {this.props.layers.map((layer, i) => {
          return (
            <div
              className={[
                css.layerRow,
                this.props.selected === i ? css.selected : ""
              ].join(" ")}
              onClick={() => this.props.onSelect(i)}
            >
              <div
                className={css.visibility}
                onClick={e => {
                  this.props.onVisibilityToggle(i);
                  e.stopPropagation();
                }}
              >
                <EyeIcon
                  style={{
                    width: 16,
                    fill: layer.visible ? "white" : "transparent"
                  }}
                />
              </div>
              <div className={css.thumb}></div>
              {layer.name}
            </div>
          );
        })}
      </div>
    );
  }
}

export default LayerTest;
