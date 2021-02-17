import React from "react";

export default function ({ style }) {
  return [
    <svg
      version="1.1"
      id="Layer_1"
      x="0px"
      y="0px"
      viewBox="0 0 485 485"
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <path
        d="M398.5,69.429c-18.778,0-34,15.222-34,34v137.75h-10V67.143c0-18.778-15.222-34-34-34s-34,15.222-34,34v174.035h-10V34
	c0-18.778-15.222-34-34-34c-18.778,0-34,15.222-34,34v207.178h-10V67.143c0-18.778-15.222-34-34-34c-18.778,0-34,15.222-34,34
	v264.035h-10v-96c0-18.778-15.222-34-34-34s-34,15.222-34,34V354c0,72.233,58.766,131,131,131h118c72.233,0,131-58.767,131-131
	V103.429C432.5,84.651,417.278,69.429,398.5,69.429z"
      />
    </svg>,
  ][0];
}
