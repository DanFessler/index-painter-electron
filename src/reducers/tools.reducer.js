import createReducer from "./utility/createReducer.js";
import { TOOLS } from "../constants.js";

const initialState = {
  // canvasRef: null,
  documents: [],
  mouse: { x: null, y: null, startx: null, starty: null, state: null },
  selectedTool: TOOLS.Brush,
  brush: {
    size: 64,
    sizePressure: true,
    flow: 50,
    flowPressure: false,
    hardness: 0,
    spacing: 20,
    aa: true
  },
  modifierKeys: {
    spaceKey: false,
    altKey: false,
    ctrlKey: false
  },
  zoomDirection: 0,

  // Per-document stuff that needs to be refactored
  canvasPos: { x: 0, y: 0, zoom: 3 },
  selectedColor: 15,
  palette: [
    [0, 0, 0],
    [255, 255, 255]
  ],
  history: { pointer: 0, history: [] },
  things: []
};

const handlers = {
  MOVE: (state, action) => {
    state.mouse = {
      ...state.mouse,
      x: action.value.x,
      y: action.value.y
    };
  },
  SET_MODIFIER: (state, action) => {
    state.modifierKeys[action.key] = action.value;
  },
  TOOL_SELECT: (state, action) => {
    state.selectedTool = action.value;
  },
  SET_ZOOM_DIRECTION: (state, action) => {
    state.zoomDirection = action.value;
  },

  SET_BRUSH_SIZE: (state, action) => {
    state.brush.size = parseInt(action.value, 10);
  },
  SET_BRUSH_SIZE_PRESSURE_TOGGLE: (state, action) => {
    state.brush.sizePressure = action.value;
  },
  SET_BRUSH_HARDNESS: (state, action) => {
    state.brush.hardness = parseInt(action.value, 10);
  },
  SET_BRUSH_FLOW: (state, action) => {
    state.brush.flow = parseInt(action.value, 10);
  },
  SET_BRUSH_FLOW_PRESSURE_TOGGLE: (state, action) => {
    state.brush.flowPressure = action.value;
  },
  SET_BRUSH_SPACING: (state, action) => {
    state.brush.spacing = parseInt(action.value, 10);
  },
  SET_BRUSH_AA: (state, action) => {
    state.brush.aa = action.value;
  },

  SET_WORKSPACE: (state, action) => {
    state.workspace = action.workspace;
  }
};

export default createReducer(initialState, handlers);
