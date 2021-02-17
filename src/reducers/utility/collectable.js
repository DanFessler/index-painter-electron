export default (
  reducer,
  config = {
    NEW: "NEW",
    CLOSE: "CLOSE"
  }
) => {
  const initialState = [];

  return function(state = initialState, action, id) {
    if (!action) return state;

    switch (action.type) {
      case config.NEW:
        return [...state, reducer()];
      case config.CLOSE:
        return state.filter((item, itemId) => itemId !== id);
      default:
        if (typeof id === "undefined") return state;
        return state.map((item, itemId) => {
          if (itemId !== id) return item;
          return reducer(state[itemId], action);
        });
    }
  };
};
