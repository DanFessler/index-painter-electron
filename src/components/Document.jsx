import React from "react";
import Canvas from "./Canvas.jsx";
import Panner from "./Panner.jsx";

// Constants
import { TOOLS } from "../constants.js";

// responsible for panning and zooming.
class Document extends React.Component {
  documentRef = React.createRef();

  state = {
    documentHover: false,
    mousePos: { x: 0, y: 0 },
    canvasPos: { x: 0, y: 0, zoom: 1 },
    dragStart: { x: 0, y: 0 },
    mouseState: null
  };

  setCanvas = canvasPos => {
    this.dispatch(
      {
        type: "SET_CANVAS_POS",
        value: canvasPos
      },
      this.props.index
    );
  };

  dispatch = (action, ...rest) => {
    this.props.dispatch(action, ...rest);
  };

  getState(key) {
    return key ? this.props.appState[key] : this.props.appState;
  }

  calculateIndex() {
    return (
      (1 / (this.props.canvas.palette.length - 1)) *
      this.props.canvas.selectedColor
    );
  }

  getCursor() {
    // console.log(state.getCurrentTool, TOOLS.Brush);
    switch (this.props.currentTool) {
      case TOOLS.Brush:
        return "default";
      case TOOLS.Pan:
        return this.getState("tools").mouse.state === "PAN"
          ? "grabbing"
          : "grab";
      case TOOLS.Zoom:
        let polarity = this.getState("tools").zoomDirection
          ? !this.getState("tools").modifierKeys.altKey
          : this.getState("tools").modifierKeys.altKey;
        return polarity ? "zoom-out" : "zoom-in";
      case TOOLS.Eyedropper:
        return "alias";
      default:
        return "auto";
    }
  }

  render() {
    return (
      <Panner
        position={this.props.view.canvasPos}
        onUpdate={this.setCanvas}
        currentTool={this.props.currentTool}
        zoomDirection={
          this.getState("tools").zoomDirection
            ? !this.getState("tools").modifierKeys.altKey
            : this.getState("tools").modifierKeys.altKey
        }
      >
        {(pos, zoom) => (
          <div
            style={{
              cursor: this.getCursor()
            }}
            onMouseOver={e => {
              this.setState({ documentHover: true });
            }}
            onMouseLeave={() => {
              this.setState({ documentHover: false });
            }}
          >
            <Canvas
              key={this.props.index}
              index={this.props.view.canvas}
              currentIndex={this.calculateIndex()}
              position={pos}
              zoom={zoom}
              canvas={this.props.canvas}
              state={this.getState("tools")}
              dispatch={action => this.dispatch(action, this.props.view.canvas)}
              tool={this.props.currentTool}
              active={this.props.active}
            />
          </div>
        )}
      </Panner>
    );
  }
}

export default Document;
