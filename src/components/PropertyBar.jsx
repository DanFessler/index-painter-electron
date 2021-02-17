import React from "react";
import InputScalar from "./InputScalar";
import InputButton from "./InputButton";
import { TOOLS } from "../constants.js";

import css from "./css/PropertyBar.module.css";

// Icons
import * as icons from "../icons";

function PropertyBar(props) {
  function getProperties() {
    switch (props.tool) {
      case TOOLS.Brush:
        return <BrushProperties {...props} />;
      case TOOLS.Zoom:
        return <ZoomProperties {...props} />;
      case TOOLS.Pan:
        return <PanProperties {...props} />;
      case TOOLS.Eyedropper:
        return <EyedropperProperties {...props} />;
      default:
        return null;
    }
  }

  return <div className={css.container}>{getProperties()}</div>;
}

function PropertyGroup(props) {
  return (
    <div
      style={{
        // height: "100%",
        paddingLeft: 12,
        paddingRight: 12,
        display: "flex",
        borderLeft: "1px solid rgba(40,40,40,0.75)"
        // padding: "10px 16px"
      }}
    >
      {props.children}
    </div>
  );
}

function BrushProperties({ state, dispatch, view }) {
  return (
    <>
      <icons.BrushIcon
        style={{
          width: 36,
          height: 36,
          // padding: "0 6px",
          padding: 6,
          marginRight: 6,
          fill: "white"
        }}
      />

      <PropertyGroup>
        <InputScalar
          name="Size"
          value={state.brush.size}
          min={1}
          max={256}
          unit="px"
          onChange={value => {
            dispatch({
              type: "SET_BRUSH_SIZE",
              value: value
            });
          }}
        />
        <div style={{ width: 4 }} />
        <InputButton
          name="Size Pen Pressure"
          onClick={() => {
            dispatch({
              type: "SET_BRUSH_SIZE_PRESSURE_TOGGLE",
              value: !state.brush.sizePressure
            });
          }}
          selected={state.brush.sizePressure}
          style={{ width: 26, height: 26, padding: 4 }}
          icon={
            <icons.PenPressure
              style={{
                // width: 16,
                // height: 16,
                fill: "white"
                // padding: 1
              }}
            />
          }
        />
      </PropertyGroup>
      <PropertyGroup>
        <InputScalar
          name="Flow"
          value={state.brush.flow}
          min={0}
          max={100}
          unit="%"
          onChange={value => {
            dispatch({
              type: "SET_BRUSH_FLOW",
              value: value
            });
          }}
        />
        <div style={{ width: 4 }} />
        <InputButton
          name="Flow Pen Pressure"
          onClick={() => {
            dispatch({
              type: "SET_BRUSH_FLOW_PRESSURE_TOGGLE",
              value: !state.brush.flowPressure
            });
          }}
          style={{ width: 26, height: 26, padding: 4 }}
          selected={state.brush.flowPressure}
          icon={
            <icons.PenPressure
              style={{
                width: 16,
                height: 16,
                fill: "white",
                padding: 1
              }}
            />
          }
        />
      </PropertyGroup>
      <PropertyGroup>
        <InputScalar
          name="Hardness"
          value={state.brush.hardness}
          min={0}
          max={100}
          unit="%"
          onChange={value => {
            dispatch({
              type: "SET_BRUSH_HARDNESS",
              value: value
            });
          }}
        />
        <div style={{ width: 4 }} />
        <InputButton
          name="Toggle Anti-alias"
          onClick={() => {
            dispatch({
              type: "SET_BRUSH_AA",
              value: !state.brush.aa
            });
          }}
          style={{ width: 26, height: 26, padding: 4 }}
          selected={!state.brush.aa}
          icon={
            <icons.AntiAlias
              style={{
                width: 16,
                height: 16,
                fill: "white",
                padding: 1
              }}
            />
          }
        />
      </PropertyGroup>
      <PropertyGroup>
        <InputScalar
          name="Spacing"
          value={state.brush.spacing}
          min={1}
          max={100}
          unit="%"
          onChange={value => {
            dispatch({
              type: "SET_BRUSH_SPACING",
              value: value
            });
          }}
        />
      </PropertyGroup>
    </>
  );
}

function ZoomProperties({ state, dispatch, view }) {
  return (
    <>
      <icons.ZoomIcon
        style={{
          width: 36,
          height: 36,
          // padding: "0 6px",
          padding: 6,
          marginRight: 6,
          fill: "white"
        }}
      />

      <PropertyGroup>
        <InputButton
          name="Zoom In"
          selected={state.zoomDirection === 0}
          style={{
            width: 32,
            height: 32,
            borderRadius: "3px 0 0 3px",
            borderRight: "none",
            padding: 6
          }}
          onClick={() => dispatch({ type: "SET_ZOOM_DIRECTION", value: 0 })}
          icon={
            <icons.ZoomInIcon
              style={{
                fill: "white"
              }}
            />
          }
        />
        {/* <div style={{ width: 4 }} /> */}
        <InputButton
          name="Zoom Out"
          right
          selected={state.zoomDirection === 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: "0 3px 3px 0",
            borderLeft: "none",
            padding: 6
          }}
          onClick={() => dispatch({ type: "SET_ZOOM_DIRECTION", value: 1 })}
          icon={
            <icons.ZoomOutIcon
              style={{
                fill: "white"
              }}
            />
          }
        />
      </PropertyGroup>
      <PropertyGroup>
        <InputButton
          name="100%"
          style={{ height: 26 }}
          onClick={() => {
            dispatch(
              {
                type: "SET_ZOOM",
                value: 1
              },
              view
            );
          }}
        />
        <div style={{ width: 4 }} />
        <InputButton
          name="Fit Screen"
          style={{ height: 26 }}
          onClick={() => {
            dispatch(
              {
                type: "FIT_SCREEN"
              },
              view
            );
          }}
        />
        <div style={{ width: 4 }} />
        <InputButton
          style={{ height: 26 }}
          name="Fill Screen"
          onClick={() => dispatch({ type: "FILL_SCREEN" }, view)}
        />
      </PropertyGroup>
    </>
  );
}

function PanProperties({ state, dispatch, view }) {
  return (
    <>
      <icons.HandIcon
        style={{
          width: 36,
          height: 36,
          // padding: "0 6px",
          padding: 6,
          marginRight: 6,
          fill: "white"
        }}
      />

      <PropertyGroup>
        <InputButton
          name="100%"
          style={{ height: 26 }}
          onClick={() => {
            dispatch(
              {
                type: "SET_ZOOM",
                value: 1
              },
              view
            );
          }}
        />
        <div style={{ width: 4 }} />
        <InputButton
          name="Fit Screen"
          style={{ height: 26 }}
          onClick={() => {
            dispatch(
              {
                type: "FIT_SCREEN"
              },
              view
            );
          }}
        />
        <div style={{ width: 4 }} />
        <InputButton
          name="Fill Screen"
          style={{ height: 26 }}
          onClick={() => dispatch({ type: "FILL_SCREEN" }, view)}
        />
      </PropertyGroup>
    </>
  );
}

function EyedropperProperties({ state, dispatch, view }) {
  return (
    <>
      <icons.EyedropperIcon
        style={{
          width: 36,
          height: 36,
          // padding: "0 6px",
          padding: 6,
          marginRight: 6,
          fill: "white"
        }}
      />
    </>
  );
}

export default PropertyBar;
