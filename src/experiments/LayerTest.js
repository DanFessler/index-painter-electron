import React, { createRef } from "react";
import ReactDOM from "react-dom";
import { observer } from "../store.js";

class Layer {
  constructor(layer) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = layer.width;
    this.canvas.height = layer.height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.putImageData(layer.data, 0, 0);
  }
}

function createImageData(width, height) {
  return {
    visible: true,
    width,
    height,
    data: document
      .createElement("canvas")
      .getContext("2d")
      .createImageData(width, height),
  };
}

class Test2 extends React.Component {
  containerRef = createRef();

  state = {
    layers: [createImageData(320, 240), createImageData(320, 240)],
    painting: false,
    active: 0,
  };

  componentDidMount() {
    this.drawLayer = new Layer(this.state.layers[0]);
    // this.containerRef.current.appendChild(this.drawLayer.canvas);
  }

  startPaint = () => {
    this.setState({ painting: true });

    window.addEventListener("pointermove", this.paint);
  };

  paint = (event) => {
    if (this.state.painting) {
      var events =
        "getCoalescedEvents" in event ? event.getCoalescedEvents() : [event];

      let gradient = this.drawLayer.ctx.createRadialGradient(
        50,
        50,
        0,
        50,
        50,
        50
      );
      gradient.addColorStop(0, "rgba(0,0,0,0.125)");
      gradient.addColorStop(1, "transparent");
      this.drawLayer.ctx.fillStyle = gradient;

      for (let e of events) {
        this.drawLayer.ctx.save();
        this.drawLayer.ctx.translate(e.clientX - 50, e.clientY - 50);
        this.drawLayer.ctx.fillRect(0, 0, 100, 100);
        this.drawLayer.ctx.restore();
      }

      let newLayers = [...this.state.layers];
      newLayers[this.state.active] = {
        ...newLayers[this.state.active],
        data: this.drawLayer.ctx.getImageData(
          0,
          0,
          this.drawLayer.canvas.width,
          this.drawLayer.canvas.height
        ),
      };

      this.setState({
        layers: newLayers,
      });
    }
  };

  stopPaint = () => {
    this.setState({ painting: false });
    window.removeEventListener("pointermove", this.paint);
  };

  setVisible = (i, visibility) => {
    console.log(i, visibility);
    let newLayers = [...this.state.layers];
    newLayers[i] = {
      ...newLayers[i],
      visible: visibility,
    };
    this.setState({ layers: newLayers });
  };

  switchLayer = (i) => {
    this.drawLayer = new Layer(this.state.layers[i]);
    this.setState({ active: i });
  };

  render() {
    return (
      <div
        onMouseDown={this.startPaint}
        // onMouseMove={this.paint}
        onMouseUp={this.stopPaint}
        ref={this.containerRef}
      >
        <div
          style={{
            position: "relative",
            width: 320,
            height: 240,
          }}
        >
          {this.state.layers.map((layer) => (
            <CanvasLayer data={layer} painting={this.state.painting} />
          ))}
        </div>
        <div>
          {this.state.layers.map((layer, i) => (
            <div
              style={{
                fontWeight: i === this.state.active ? "bold" : "normal",
              }}
            >
              <span onClick={() => this.setVisible(i, !layer.visible)}>
                {layer.visible ? "<o>" : "<->"}
              </span>
              <span onClick={() => this.switchLayer(i)}>Layer {i}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

class CanvasLayer extends React.Component {
  containerRef = createRef();
  componentDidUpdate() {
    // this.containerRef.current.appendChild(this.props.layer.canvas);
    if (this.props.data.visible) {
      const ctx = this.containerRef.current.getContext("2d");
      ctx.putImageData(this.props.data.data, 0, 0);
    }
  }
  render() {
    if (!this.props.data.visible) return null;
    return (
      <canvas
        width={this.props.data.width}
        height={this.props.data.height}
        ref={this.containerRef}
        style={{
          position: "absolute",
          opacity: this.props.data.visible ? "1" : "0",
          border: "1px solid black",
        }}
      >
        {this.props.painting}
      </canvas>
    );
  }
}

export default observer(Test2);
