import React from "react";
import View from "./View.jsx";
import Panner from "./Panner.jsx";

class DocumentPreview extends React.Component {
  state = {
    canvasPos: { x: 0, y: 0, zoom: 1 }
  };

  static defaultProps = {
    id: "preview",
    title: "PREVIEW"
  };

  getState(key) {
    return key ? this.props.appState[key] : this.props.appState;
  }

  setCanvas = canvasPos => {
    this.setState(state => {
      return {
        ...state,
        canvasPos: {
          ...state.canvasPos,
          ...canvasPos
        }
      };
    });
  };

  render() {
    return (
      <div style={{ padding: 3, flexGrow: 1, display: "flex" }}>
        <Panner
          position={this.state.canvasPos}
          onUpdate={this.setCanvas}
          currentTool={this.props.currentTool}
          zoomDirection={
            this.getState("tools").zoomDirection
              ? !this.getState("tools").modifierKeys.altKey
              : this.getState("tools").modifierKeys.altKey
          }
        >
          {(pos, zoom) => (
            <View canvas={this.props.appCanvas} position={pos} zoom={zoom} />
          )}
        </Panner>
      </div>
    );
  }
}

export default DocumentPreview;
