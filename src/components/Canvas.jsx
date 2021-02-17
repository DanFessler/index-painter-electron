import React, { useRef, useEffect } from "react";
import Window from "./WindowProxy.jsx";
import View from "./View.jsx";
import * as Three from "three";

import { TOOLS } from "../constants.js";

import css from "./css/Canvas.module.css";

// { appCanvas, position, zoom, state, currentIndex, tool }
class Canvas extends React.Component {
  containerRef = React.createRef();

  state = {
    dragging: false
  };

  componentDidMount() {
    // this.getCanvas().onChange = history => {
    //   this.props.dispatch({
    //     type: "SET_HISTORY",
    //     value: history
    //   });
    // };

    // this.getCanvas().setHistory(this.getCanvas().historyPointer);
    this.updateCanvas();
  }

  componentDidUpdate(prevProps) {
    // let canvas = this.getCanvas();
    // console.log("LAYERDATA", this.props.canvas);
    if (this.props.canvas.layerData) {
      if (this.props.canvas.layerData !== prevProps.canvas.layerData)
        this.updateCanvas();
    }
  }

  updateCanvas() {
    this.getCanvas().pushLayerData(this.props.canvas.layerData);
  }

  getCanvas() {
    return this.props.canvas.canvas;
  }

  getMouseCanvasPos = e => {
    let pos = this.getMousePos(e);
    let size = new Three.Vector2();
    let zoom = this.props.zoom;
    this.getCanvas().renderer.getSize(size);

    pos.x = (pos.x - (this.props.position.x - (size.x * zoom) / 2)) / zoom;
    pos.y = (pos.y - (this.props.position.y - (size.y * zoom) / 2)) / zoom;

    return pos;
  };

  smoothstep(a, b, t) {
    // Scale, bias and saturate x to 0..1 range
    t = Math.min(Math.max((t - a) / (b - a), 0.0), 1.0);
    // Evaluate polynomial
    return t * t * (3 - 2 * t);
  }

  getMousePos = e => {
    let rect = this.containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      z: e.pointerType === "pen" ? this.smoothstep(0, 1, e.pressure) : 1
    };
  };

  handleMouseDown = e => {
    // e.preventDefault();
    if (this.props.active) {
      if (this.props.tool === TOOLS.Brush && e.button === 0) {
        this.getCanvas().beginStroke(
          this.getMouseCanvasPos(e),
          this.props.state.brush,
          this.props.currentIndex
        );
        this.setState({ dragging: true });
      }
    }
  };

  handleMouseUp = e => {
    if (this.state.dragging) {
      this.getCanvas().endStroke();
      this.props.dispatch({
        type: "BRUSH",
        value: this.getCanvas().getLayerData()
      });
      // this.props.dispatch({
      //   type: "SET_HISTORY",
      //   value: history,
      //   documentId: this.props.index
      // });
      this.setState({ dragging: false });
    }
  };

  handleMouseMove = e => {
    e.preventDefault();
    if (this.getCanvas().isBrushing && this.state.dragging) {
      // testing performance of different stroke methods
      if (!e.ctrlKey) {
        this.getCanvas().polyStroke(
          this.getMouseCanvasPos(e),
          this.props.state.brush,
          this.props.currentIndex
        );
      } else {
        this.getCanvas().stroke(
          this.getMouseCanvasPos(e),
          this.props.state.brush,
          this.props.currentIndex
        );
      }
    }
  };

  handleResize = e => {
    this.getCanvas().draw();
  };

  render() {
    return (
      <Window
        events={{
          pointerup: this.handleMouseUp,
          pointermove: this.handleMouseMove,
          resize: this.handleResize
        }}
      >
        <div
          className={css.canvasContainer}
          onPointerDown={this.handleMouseDown}
          ref={this.containerRef}
          // style={{ backgroundColor: "red" }}
        >
          <View
            canvas={this.getCanvas()}
            zoom={this.props.zoom}
            position={this.props.position}
          />
        </div>
      </Window>
    );
  }
}

export default Canvas;
