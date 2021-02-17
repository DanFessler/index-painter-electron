import React from "react";
import Window from "./WindowProxy.jsx";

// Styles
import css from "./css/Document.module.css";

// Constants
import { TOOLS } from "../constants.js";

// responsible for panning and zooming.
class Panner extends React.Component {
  documentRef = React.createRef();

  state = {
    mousePos: { x: 0, y: 0 },
    dragStart: { x: 0, y: 0 },
    mouseState: null
  };

  setCanvas = canvasPos => {
    this.props.onUpdate(canvasPos);
  };

  componentDidMount() {
    // center canvas
    let rect = this.documentRef.current.getBoundingClientRect();
    this.setCanvas({
      x: rect.width / 2,
      y: rect.height / 2
    });
  }

  handleMouseDown = e => {
    // e.preventDefault();

    let newState = { dragStart: { x: e.clientX, y: e.clientY } };

    switch (this.props.currentTool) {
      case TOOLS.Pan:
        if (e.button === 0) {
          newState.mouseState = "PAN";
        }
        break;
      case TOOLS.Zoom:
        if (e.button === 0) {
          newState.mouseState = "ZOOM";
        }
        break;
      default:
        return;
    }

    this.setState(state => {
      return { ...state, ...newState };
    });
  };

  handleMouseUp = e => {
    if (this.state.mouseState === "PAN") {
      this.setState(state => {
        return {
          mouseState: null
        };
      });
      this.setCanvas({
        x:
          this.props.position.x +
          (this.state.mousePos.x - this.state.dragStart.x),
        y:
          this.props.position.y +
          (this.state.mousePos.y - this.state.dragStart.y)
      });
    }
    if (this.state.mouseState === "ZOOM") {
      let d = this.state.mousePos.x - this.state.dragStart.x;

      let polarity = this.props.zoomDirection;

      let newZoom = Math.max(
        Math.min(
          d
            ? this.getCurrentZoom()
            : polarity
            ? this.props.position.zoom / 2
            : this.props.position.zoom * 2,
          256
        ),
        0.5
      );

      let rect = this.documentRef.current.getBoundingClientRect();

      let position = {
        x: this.state.dragStart.x - rect.left,
        y: this.state.dragStart.y - rect.top
      };

      let zoom =
        newZoom >= this.props.position.zoom
          ? Math.ceil(newZoom * 2) / 2
          : Math.floor(newZoom * 2) / 2;

      this.setState(state => {
        let zoomRatio = zoom / this.props.position.zoom;
        this.setCanvas({
          x: position.x - (position.x - this.props.position.x) * zoomRatio,
          y: position.y - (position.y - this.props.position.y) * zoomRatio,
          zoom: zoom
        });
        return {
          mouseState: null
        };
      });
    }
  };

  handleMouseMove = e => {
    e.preventDefault();
    this.setState(state => {
      return {
        mousePos: { x: e.clientX, y: e.clientY }
      };
    });
  };

  getCurrentZoom() {
    if (this.state.mouseState === "ZOOM") {
      let d = this.state.mousePos.x - this.state.dragStart.x;
      let newZoom = Math.pow(1.01, d) * this.props.position.zoom;
      return Math.min(Math.max(0.5, newZoom), 256);
    }
    return this.props.position.zoom;
  }

  currentCanvasPos() {
    let canvasPos = this.props.position;
    if (this.state.mouseState === "PAN") {
      return {
        x: canvasPos.x + (this.state.mousePos.x - this.state.dragStart.x),
        y: canvasPos.y + (this.state.mousePos.y - this.state.dragStart.y)
      };
    }
    if (this.state.mouseState === "ZOOM") {
      let zoomRatio = this.getCurrentZoom() / canvasPos.zoom;

      // put coords in document space
      let rect = this.documentRef.current.getBoundingClientRect();
      let x = this.state.dragStart.x - rect.left;
      let y = this.state.dragStart.y - rect.top;

      return {
        x: x - (x - canvasPos.x) * zoomRatio,
        y: y - (y - canvasPos.y) * zoomRatio
      };
    }
    return canvasPos;
  }

  render() {
    return (
      <Window
        events={{
          pointerup: this.handleMouseUp,
          pointermove: this.handleMouseMove
        }}
      >
        <div className={css.centerPanel}>
          <div
            ref={this.documentRef}
            className={css.documentContainer}
            onPointerDown={this.handleMouseDown}
          >
            {this.props.children(
              this.currentCanvasPos(),
              this.getCurrentZoom()
            )}
          </div>
        </div>
      </Window>
    );
  }
}

export default Panner;
