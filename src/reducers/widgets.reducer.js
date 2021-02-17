import createReducer from "./utility/createReducer.js";

const initialState = { hidden: {} };

const handlers = {
  HIDE: (state, action) => {
    state.hidden[action.value] = true;
  },
  SHOW: (state, action) => {
    state.hidden[action.value] = false;
  },
  SET_HIDDEN: (state, action) => {
    state.hidden[action.widget] = action.hidden;
  }
};

export default createReducer(initialState, handlers);
