import createActions from "./createActions.js";
import { filteredReducer } from "./filterReducer.js";

export default function undoable(
  undoableReducer,
  actionMetadata,
  maxHistoryStates = 3
) {
  const initialState = undoableReducer();

  return function(state = initialState, action, ...rest) {
    if (!action) {
      if (!state.history) {
        return createNew(state, "New Document");
      } else {
        return state;
      }
    }

    const { actions, pointer, saved, savedPointer } = state.history;
    switch (action.type) {
      case "UNDO":
        if (pointer <= 0) return state;

        return {
          ...actions[pointer - 1].state,
          history: {
            ...state.history,
            actions: actions,
            pointer: pointer - 1,
            savedPointer: null
          }
        };
      case "REDO":
        if (pointer === actions.length - 1) return state;
        return {
          ...actions[pointer + 1].state,
          history: {
            ...state.history,
            actions: actions,
            pointer: pointer + 1,
            savedPointer: null
          }
        };
      case "JUMP":
        return {
          ...actions[action.index].state,
          history: {
            ...state.history,
            actions: actions,
            pointer: action.index,
            savedPointer: null
          }
        };
      case "JUMP_SAVED":
        return {
          ...saved[action.index].state,
          history: {
            ...state.history,
            pointer: -1,
            savedPointer: action.index
          }
        };
      case "SAVE": {
        const currentState =
          savedPointer !== null ? saved[savedPointer] : actions[pointer];

        const newSaved = [
          ...saved,
          {
            ...currentState,
            meta: {
              ...currentState.meta,
              icon: "CameraIcon"
            }
          }
        ];

        return {
          ...state,
          history: {
            ...state.history,
            saved: newSaved
          }
        };
      }
      case "RENAME_SAVED":
        let renamedSave = state.history.saved.map((savedState, i) => {
          return i === action.index
            ? { ...savedState, meta: { ...savedState.meta, name: action.name } }
            : savedState;
        });

        return {
          ...state,
          history: {
            ...state.history,
            saved: renamedSave
          }
        };
      default:
        const isSnapshot = savedPointer !== null;
        const oldState = isSnapshot ? saved[savedPointer] : actions[pointer];
        const newState = undoableReducer(oldState.state, action);

        // If the new state didn't change, just return the current state
        if (isEqual(newState, oldState.state)) return oldState;

        // if we're operating on a saved snapshot, push the snapshot as
        // the first state in the history, otherwise chop trailing ends
        // of previous history
        let newActionHistory = isSnapshot
          ? [oldState]
          : actions.slice(
              Math.max(actions.length - (maxHistoryStates - 1), 0),
              pointer + 1
            );

        // Push new history state
        newActionHistory.push({
          type: action.type,
          state: newState,
          meta: actionMetadata ? actionMetadata[action.type] : null
        });

        // Return the new state and updated history
        return {
          ...newState,
          history: {
            ...state.history,
            actions: newActionHistory,
            pointer: newActionHistory.length - 1,
            savedPointer: null
          }
        };
    }
  };

  // Shallow compare two objects, using only the keys from the first
  function isEqual(obj1, obj2) {
    return Object.keys(obj1).reduce((acc, key) => {
      if (obj1[key] === obj2[key]) return acc && true;
      else return false;
    }, true);
  }

  function createNew(state, name) {
    const action = {
      type: "INIT",
      state: { ...state },
      meta: { name: name, icon: "CameraIcon" }
    };
    return {
      ...state,
      history: {
        actions: [action],
        saved: [action],
        pointer: 0,
        savedPointer: null
      }
    };
  }
}

export function undoableReducer(initialState, handlers, maxHistoryStates = 3) {
  const [undoableActions, undoableMetadata] = createActions(handlers);
  return undoable(
    filteredReducer(initialState, undoableActions),
    undoableMetadata,
    maxHistoryStates
  );
}
