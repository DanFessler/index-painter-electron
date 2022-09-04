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

import React from "react";
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

import Test from "./experiments/PopupTest";

// Styles
import css from "./App.module.css";
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
    let canvas =
      this.getState().documents.canvases[this.getActiveDocument().canvas];
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
                    spacing={2}
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

export default observer(App);
