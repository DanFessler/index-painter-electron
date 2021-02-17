import { undoableReducer } from "./utility/undoable.js";
import createReducer from "./utility/createReducer.js";

const persistent = createReducer(
  {
    canvas: undefined,
    selectedColor: 0,
    palette: [[0, 0, 0], [255, 255, 255]],
    count: 1
  },
  {
    SET_SELECTED_COLOR: (state, action) => {
      state.selectedColor = action.value;
    },
    SET_PALETTE: (state, action) => {
      state.palette = action.value;
    },
    TOGGLE_INDEX: (state, action) => {
      state.canvas.drawIndexed = action.value;
      state.canvas.draw();
    }
  }
);

const undoable = undoableReducer(
  {
    layerData: null
  },
  {
    BRUSH: {
      name: "Brush Stroke",
      icon: "BrushIcon",
      reducer: (state, action) => {
        state.layerData = action.value;
      }
    }
  },
  25
);

// Only undoable filters the state to it's own slice, so it must come
// after persistent reducers, otherwise the state will be masked.
export default (state, action, ...rest) => ({
  ...persistent(state, action, ...rest),
  ...undoable(state, action, ...rest)
});
