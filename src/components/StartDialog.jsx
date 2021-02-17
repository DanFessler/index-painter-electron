import React from "react";

function StartProject({ dispatch, state }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1
      }}
    >
      <div
        style={{
          width: 256,
          padding: 8,
          cursor: "pointer",
          // height: 256,
          // border: "1px solid white",
          borderRadius: 8,
          backgroundColor: "var(--primary)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
        }}
      >
        <div
          onClick={() =>
            dispatch({
              type: "CREATE_NEW_DOCUMENT",
              title: "New Document",
              width: 512,
              height: 256
            })
          }
        >
          New Document
        </div>
      </div>
    </div>
  );
}

export default StartProject;
