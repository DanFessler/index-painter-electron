import React from "react";
import Dockable from "../dockable/Dockable.js";
import Document from "./Document.jsx";

// Manages the Dockable container of Documents
class DocumentContainer extends React.Component {
  static defaultProps = {
    title: "Documents",
    id: "documents"
  };

  render() {
    let { state, dispatch, currentTool } = this.props;
    // console.log(state, dispatch);
    return (
      <div style={{ display: "flex", flexGrow: 1 }}>
        <Dockable
          initialState={state.documents.workspace}
          onUpdate={workspace => {
            dispatch({
              type: "SET_DOCUMENT_WORKSPACE",
              value: workspace
            });
          }}
          spacing={3}
          active={state.documents.activeDocument}
          onActive={documentId => {
            dispatch({
              type: "SET_ACTIVE_DOCUMENT",
              value: documentId
            });
          }}
          hideMenus
        >
          {state.documents.views.map((view, i) => (
            <Document
              key={i}
              id={view.id}
              view={view}
              canvas={state.documents.canvases[view.canvas]}
              title={`${view.title} @ ${Math.floor(
                view.canvasPos.zoom * 100
              )}%`}
              index={i}
              onClose={id => dispatch({ type: "CLOSE_DOCUMENT", id })}
              active={view.id === state.documents.activeDocument}
              closeable
              appState={state}
              dispatch={dispatch}
              currentTool={currentTool}
            />
          ))}
        </Dockable>
      </div>
    );
  }
}

export default DocumentContainer;
