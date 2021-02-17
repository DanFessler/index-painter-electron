import createReducer from "./utility/createReducer.js";

const viewReducer = createReducer(undefined, {
  SET_CANVAS_POS: (viewState, action) => {
    viewState.canvasPos = { ...viewState.canvasPos, ...action.value };
  },
  SET_ZOOM: (viewState, action) => {
    viewState.canvasPos.zoom = action.value;
  },
  FIT_SCREEN: (viewState, action, state) => {
    let canvas = state.canvases[viewState.canvas];
    let canvasSize = canvas.canvas.renderer.getSize();
    let docSize = canvas.canvas.views[0].canvas.parentElement.parentElement.parentElement.getBoundingClientRect();

    let zoom = Math.min(
      docSize.width / canvasSize.x,
      docSize.height / canvasSize.y
    );

    viewState.canvasPos = {
      zoom: zoom,
      x: docSize.width / 2,
      y: docSize.height / 2
    };
  },
  FILL_SCREEN: (view, action, state) => {
    let canvas = state.canvases[view.canvas];
    let canvasSize = canvas.canvas.renderer.getSize();
    let docSize = canvas.canvas.views[0].canvas.parentElement.parentElement.parentElement.getBoundingClientRect();

    let zoom = Math.max(
      docSize.width / canvasSize.x,
      docSize.height / canvasSize.y
    );

    view.canvasPos = {
      zoom: zoom,
      x: docSize.width / 2,
      y: docSize.height / 2
    };
  }
});

export default viewReducer;
