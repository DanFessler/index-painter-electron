// TODO:
// Improvements:
// - label slider sensitivity
// - better min spacing (abs 1px)
// brush cursor component needs to be redone (inner circle misalignment)
// Document navigation state needs to be handled by reducer

// BUG:
// Dockable messes up my tablet input
//    problem in dockable.module.css overflow-y
//    disabling that line introduces panel window scroll issues (out of bounds)
// still get in states where i'm locked into an modifier-key

import React, { createRef } from "react";
import ReactDOM from "react-dom";
import Dockable from "./dockable/Dockable.js";

// Constants
import { TOOLS } from "./constants.js";

// Components
import MenuBar from "./components/MenuBar.jsx";
import ToolBar from "./components/ToolBar.jsx";
import PropertyBar from "./components/PropertyBar.jsx";
import History, { Snapshots } from "./components/History.jsx";
import Layers from "./components/Layers.jsx";
import CanvasProperties from "./components/CanvasProperties.jsx";
import DocumentContainer from "./components/DocumentContainer.jsx";
import DocumentPreview from "./components/DocumentPreview.jsx";
import Window from "./components/WindowProxy.jsx";
import Palette from "./components/Palette.jsx";
import StartDialog from "./components/StartDialog.jsx";
// import BrushCursor from "./components/BrushCursor.jsx";

// Styles
import css from "./App.module.css";
import windowCSS from "./dockable/css/Window.module.css";

// State
import reducer from "./reducer.js";
import { observer } from "./store.js";

class App extends React.Component {
  getState() {
    return this.props.state;
  }

  dispatch = (action, ...rest) => {
    this.props.dispatch(action, ...rest);
  };

  componentDidMount() {
    // TEMP Creating a new Doc by default to speed up iteration
    this.dispatch({
      type: "CREATE_NEW_DOCUMENT",
      title: "New Document 1",
      width: 512,
      height: 256,
    });
  }

  handleKeyDown = (e) => {
    switch (e.key) {
      case " ":
        this.dispatch({ type: "SET_MODIFIER", key: "spaceKey", value: true });
        break;
      case "Alt":
        this.dispatch({ type: "SET_MODIFIER", key: "altKey", value: true });
        break;
      case "Control":
        this.dispatch({ type: "SET_MODIFIER", key: "ctrlKey", value: true });
        break;
      case "Z":
      case "z":
        if (e.ctrlKey) {
          if (e.shiftKey) {
            this.dispatch({ type: "REDO" }, this.getActiveDocument().canvas);
          } else {
            this.dispatch({ type: "UNDO" }, this.getActiveDocument().canvas);
          }
        }
        break;
      default:
        return;
    }
  };

  handleKeyUp = (e) => {
    switch (e.key) {
      case " ":
        this.dispatch({ type: "SET_MODIFIER", key: "spaceKey", value: false });
        break;
      case "Alt":
        this.dispatch({ type: "SET_MODIFIER", key: "altKey", value: false });
        break;
      case "Control":
        this.dispatch({ type: "SET_MODIFIER", key: "ctrlKey", value: false });
        break;
      default:
        return;
    }
  };

  getCurrentTool() {
    if (this.getToolsState().modifierKeys.spaceKey) {
      if (
        this.getToolsState().modifierKeys.altKey ||
        this.getToolsState().modifierKeys.ctrlKey
      )
        return TOOLS.Zoom;
      return TOOLS.Pan;
    }
    if (this.getToolsState().selectedTool === TOOLS.Brush) {
      if (this.getToolsState().modifierKeys.altKey) return TOOLS.Eyedropper;
    }
    return this.getToolsState().selectedTool;
  }

  getActiveDocument = () => {
    return this.getState().documents.views.find(
      (doc) => doc.id === this.getState().documents.activeDocument
    );
  };

  getActiveCanvas = () => {
    let canvas = this.getState().documents.canvases[
      this.getActiveDocument().canvas
    ];
    return canvas;
  };

  getToolsState() {
    return this.getState().tools;
  }

  isDocumentOpen() {
    return this.getState().documents.views.length;
  }

  getWidgets() {
    if (!this.isDocumentOpen()) return [];
    return (
      <>
        <DocumentContainer
          // key="document"
          state={this.getState()}
          dispatch={this.dispatch}
          currentTool={this.getCurrentTool()}
          unhidable
        />
        <DocumentPreview
          // key="preview"
          appState={this.getState()}
          currentTool={this.getCurrentTool()}
          appCanvas={this.getActiveCanvas().canvas}
          // minHeight={240}
        />
        <History
          // key="history"
          data={this.getActiveCanvas().history}
          dispatch={(a) => this.dispatch(a, this.getActiveDocument().canvas)}
        />
        <Snapshots
          // key="history"
          data={this.getActiveCanvas().history}
          dispatch={(a) => this.dispatch(a, this.getActiveDocument().canvas)}
        />
        <CanvasProperties
          // key="canvasProperites"
          canvas={this.getActiveCanvas()}
          dispatch={(a) => this.dispatch(a, this.getActiveDocument().canvas)}
        />
        <Palette
          // key="palette"
          minHeight={40}
          palette={this.getToolsState().palette}
          selected={this.getToolsState().selectedColor}
          dispatch={(a) => this.dispatch(a, this.getActiveDocument().canvas)}
        />
        <Layers
          // key="palette"
          minHeight={40}
          palette={this.getToolsState().palette}
          selected={this.getToolsState().selectedColor}
          dispatch={(a) => this.dispatch(a, this.getActiveDocument().canvas)}
        />
      </>
    ).props.children;
  }

  render() {
    return (
      <Window
        events={{
          keydown: this.handleKeyDown,
          keyup: this.handleKeyUp,
        }}
      >
        <div
          className={css.App}
          style={{
            display: "flex",
            flexDirection: "column",
            // Dark Theme
          }}
        >
          <MenuBar
            dispatch={this.dispatch}
            widgets={this.getWidgets()
              .filter((widget) => !widget.props.unhidable)
              .map((widget) => ({
                id: widget.props.id,
                title: widget.props.title,
              }))}
            hidden={this.getState().widgets.hidden}
          />

          {this.isDocumentOpen() ? (
            <>
              <PropertyBar
                state={this.getToolsState()}
                dispatch={this.dispatch}
                tool={this.getCurrentTool()}
                view={this.getState().documents.views.findIndex(
                  (view) => view.id === this.getState().documents.activeDocument
                )}
              />
              <div
                style={{
                  flexGrow: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <ToolBar
                  selected={this.getCurrentTool()}
                  dispatch={this.dispatch}
                />
                <div
                  style={{
                    flexGrow: 1,
                    maxWidth: `calc(100% - 47px)`,

                    margin: "1px 0 0 1px",
                    // margin: 3,
                  }}
                >
                  <Dockable
                    initialState={this.getState().workspace}
                    onUpdate={(workspace) =>
                      this.dispatch({
                        type: "SET_WORKSPACE",
                        workspace: workspace,
                      })
                    }
                    spacing={3}
                    hidden={this.getState().widgets.hidden}
                  >
                    {this.getWidgets()}
                  </Dockable>
                </div>
              </div>
            </>
          ) : (
            <StartDialog dispatch={this.dispatch} state={this.getState()} />
          )}
        </div>
      </Window>
    );
  }
}

// Test widget to display components as popups
class Test extends React.Component {
  state = {
    externalWindow: null,
    containerElement: null,
  };
  componentDidMount() {
    const features = "width=800, height=500, left=300, top=200, menubar=no";
    const externalWindow = window.open("", "", features);

    let containerElement = null;
    if (externalWindow) {
      containerElement = externalWindow.document.createElement("div");
      externalWindow.document.body.appendChild(containerElement);

      // Copy the app's styles into the new window
      const stylesheets = Array.from(document.styleSheets);
      stylesheets.forEach((stylesheet) => {
        const css = stylesheet;

        if (stylesheet.href) {
          const newStyleElement = document.createElement("link");
          newStyleElement.rel = "stylesheet";
          newStyleElement.href = stylesheet.href;
          externalWindow.document.head.appendChild(newStyleElement);
        } else if (css && css.cssRules && css.cssRules.length > 0) {
          const newStyleElement = document.createElement("style");
          Array.from(css.cssRules).forEach((rule) => {
            newStyleElement.appendChild(document.createTextNode(rule.cssText));
          });
          externalWindow.document.head.appendChild(newStyleElement);
        }
      });
    }

    this.setState({
      externalWindow: externalWindow,
      containerElement: containerElement,
    });
  }
  render() {
    if (this.state.containerElement) {
      return ReactDOM.createPortal(
        this.props.children,
        this.state.containerElement
      );
    }
    return null;
  }
}

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
