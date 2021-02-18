import ThreeCanvas from "../canvas.js";
import produce, { setAutoFreeze } from "immer";
import canvasReducer from "./canvas.reducer.js";
import viewReducer from "./view.reducer.js";

setAutoFreeze(false);

// how to get canvas data:
// pass reference as a param up through component tree
// pass action as a parm through component tree
// import it directly from a shared resource.
// manage updating relevant data to state

let docId = 0;

const initialState = {
  views: [],
  canvases: [],
  workspace: [],
  activeDocument: 0
};

const handlers = {
  CREATE_NEW_DOCUMENT: (state, { title, width, height }) => {
    let threeCanvas = new ThreeCanvas(width, height, [
      [0, 0, 0],
      [256, 256, 256]
    ]);

    state.canvases.push(
      canvasReducer({
        canvas: threeCanvas,
        palette: threeCanvas.palette,
        layerData: threeCanvas.getLayerData(),
        selectedColor: 1,
        count: 1
      })
    );

    createDocument(state, {
      id: docId++,
      title: title,
      canvas: state.canvases.length - 1,
      canvasPos: { x: 0, y: 0, zoom: 3 }
    });
  },
  CREATE_NEW_DOCUMENT_VIEW: (state, action) => {
    let view = {
      ...findView(state.views, state.activeDocument),
      id: docId++
    };
    state.canvases[view.canvas].count++;

    createDocument(state, view);
  },
  CLOSE_DOCUMENT: (state, { id }) => {
    let view = findView(state.views, state.activeDocument);
    let canvas = state.canvases[view.canvas];
    canvas.count--;

    // if this is the last view for the doc, then close the doc for real
    if (canvas.count === 0) {
      state.canvases = state.canvases.filter((canvas, i) => i !== view.canvas);
    }

    state.views = state.views.filter(view => view.id !== id);
    state.activeDocument = state.views.length
      ? state.views[state.views.length - 1].id
      : null;
  },
  SET_ACTIVE_DOCUMENT: (state, action) => {
    state.activeDocument = action.value;
  },
  SET_DOCUMENT_WORKSPACE: (state, action) => {
    state.workspace = action.value;
  }
};

function findView(documents, id) {
  return documents.find(doc => doc.id === id);
}

function createDocument(state, document) {
  // if this is the first document, set up the workspace
  if (!state.workspace.length) {
    state.workspace = [
      {
        windows: [
          {
            selected: 0,
            // hideTabs: true,
            widgets: []
          }
        ]
      }
    ];
  }

  state.views.push(document);

  state.activeDocument = document.id;
  state.workspace[0].windows[0].widgets.push(document.id);
  state.workspace[0].windows[0].selected =
    state.workspace[0].windows[0].widgets.length - 1;
}

function documentHandler(state = initialState, action, id) {
  return produce(state, draft => {
    // perform shared-concern actions
    if (action && handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](draft, action);
    }
    // Otherwise delegate to view and canvas reducers
    else if (typeof id !== "undefined") {
      draft.views = draft.views.map((view, viewId) => {
        if (viewId !== id) return view;
        return viewReducer(view, action, draft);
      });
      draft.canvases = draft.canvases.map((canvas, canvasId) => {
        if (canvasId !== id) return canvas;
        return canvasReducer(canvas, action, draft);
      });
    }
  });
}

export default documentHandler;
