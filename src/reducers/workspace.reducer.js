import createReducer from "./utility/createReducer.js";

const workspaceReducer = createReducer(
  [
    {
      // size: 982.015625,
      minSize: 277,
      size: "100%",
      windows: [
        {
          size: "100%",
          selected: 0,
          widgets: ["documents"],
          minSize: 30,
          hideTabs: true,
          style: {
            backgroundColor: "transparent",
            margin: 0,
            boxShadow: "none",
            borderRadius: 0
          }
        },
        {
          selected: 0,
          widgets: ["palette"],
          minSize: 68,
          size: 68
        }
      ],
      maxSize: 0
    },
    {
      size: 500,
      minSize: 277,
      windows: [
        {
          selected: 0,
          widgets: ["preview", "canvasProperites"],
          size: 320
        },
        { selected: 0, widgets: ["history"] },
        { selected: 0, widgets: ["layers"] }
      ],
      maxSize: 0
    }
  ],
  {
    SET_WORKSPACE: (state, action) => {
      return action.workspace;
    }
  }
);

export default workspaceReducer;
