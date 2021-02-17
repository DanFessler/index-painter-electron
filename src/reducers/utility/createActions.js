export default function createActions(actions) {
  let reducers = {};
  let meta = {};

  Object.keys(actions).forEach(actionType => {
    const { name, icon, reducer } = actions[actionType];
    meta[actionType] = { name: name ? name : actionType, icon: icon };
    reducers[actionType] = reducer;
  });

  return [reducers, meta];
}
