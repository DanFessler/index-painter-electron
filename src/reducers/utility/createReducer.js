import produce, { setAutoFreeze, original } from "immer";

// solves some immer bugs with setState in dockable.
setAutoFreeze(false);

function createReducer(initialState, handlers, enforceShape = false) {
  return function reducer(state = initialState, action, ...rest) {
    return produce(state, draft => {
      if (action && handlers.hasOwnProperty(action.type)) {
        return handlers[action.type](state, action, ...rest);
      }
    });
  };
}

export default createReducer;
