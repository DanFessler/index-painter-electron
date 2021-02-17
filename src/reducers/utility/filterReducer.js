import createReducer from "./createReducer.js";

export default function filterReducer(reducer, initialState) {
  // const initialState = reducer();

  const filter = state =>
    Object.keys(state)
      .filter(key => Object.keys(initialState).includes(key))
      .reduce((obj, key) => {
        return {
          ...obj,
          [key]: state[key]
        };
      }, {});

  return (state = initialState, action, ...rest) => {
    return reducer(filter(state), action, ...rest);
  };
}

export function filteredReducer(initialState, handlers) {
  return filterReducer(createReducer(initialState, handlers), initialState);
}
