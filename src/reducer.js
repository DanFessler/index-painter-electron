import documentsReducer from "./reducers/documents.reducer.js";
import workspaceReducer from "./reducers/workspace.reducer.js";
import toolsReducer from "./reducers/tools.reducer.js";
import widgetsReducer from "./reducers/widgets.reducer.js";

export default function reducer(state, action, ...rest) {
  return {
    tools: toolsReducer(state && state.tools, action, ...rest),
    documents: documentsReducer(state && state.documents, action, ...rest),
    workspace: workspaceReducer(state && state.workspace, action, ...rest),
    widgets: widgetsReducer(state && state.widgets, action, ...rest)
  };
}
