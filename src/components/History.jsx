import React, { useEffect, useRef } from "react";
import * as icons from "../icons";

import css from "./css/History.module.css";

class History extends React.Component {
  onClick = i => {
    this.props.dispatch({
      type: "JUMP",
      index: i
    });
  };

  static defaultProps = {
    id: "history",
    title: "HISTORY",
    actions: widget => [
      {
        type: "actions",
        actions: {
          "Save Snapshot": () => {
            widget.props.dispatch({
              type: "SAVE"
            });
          }
        }
      }
    ]
  };

  render() {
    return (
      <div className={css.container}>
        {this.props.showSnapshots && <Snapshots {...this.props} />}
        <div className={css.historyContainer}>
          {this.props.data.actions.map((change, i) => {
            let Icon = change.meta && icons[change.meta.icon];

            return (
              <div
                key={i}
                className={[
                  css.actionRow,
                  i > this.props.data.pointer && css.inactive,
                  i === this.props.data.pointer && css.selected
                ].join(" ")}
                onClick={() => this.onClick(i)}
              >
                {Icon ? (
                  <Icon
                    style={{
                      fill:
                        i > this.props.data.pointer
                          ? "var(--textAlpha)"
                          : "white",
                      width: 16,
                      height: 16,
                      marginRight: 8
                    }}
                  />
                ) : null}
                {change.meta ? change.meta.name : change.type}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export class Snapshots extends React.Component {
  onSnapshotClick = i => {
    this.props.dispatch({
      type: "JUMP_SAVED",
      index: i
    });
  };

  onSnapshotRename = (i, name) => {
    this.props.dispatch({
      type: "RENAME_SAVED",
      name: name,
      index: i
    });
  };

  render() {
    return (
      <div className={css.snapshotsContainer}>
        {this.props.data.saved.map((item, i) => {
          return (
            <Snapshot
              data={item}
              key={i}
              index={i}
              onClick={() => this.onSnapshotClick(i)}
              onRename={name => this.onSnapshotRename(i, name)}
              selected={i === this.props.data.savedPointer}
            />
          );
        })}
      </div>
    );
  }
}

function Snapshot({ data, index, onClick, selected, onRename }) {
  const canvasRef = useRef();

  useEffect(() => {
    let ctx = canvasRef.current.getContext("2d");
    ctx.putImageData(data.state.layerData, 0, 0);
  }, [data]);

  return (
    <div
      className={[css.snapshotRow, selected && css.selected].join(" ")}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        width={data.state.layerData.width}
        height={data.state.layerData.height}
        className={css.snaphotCanvas}
      ></canvas>
      <div className={css.actionLabel} style={{}}>
        <EditableText value={data.meta.name} onChange={onRename} />
      </div>
    </div>
  );
}

class EditableText extends React.Component {
  inputRef = React.createRef();

  state = { editing: false };

  componentDidUpdate() {
    this.inputRef.current.focus();
  }

  beginEdit = e => {
    this.inputRef.current.select();
    this.setState({ editing: true });
  };

  endEdit = e => {
    this.setState({ editing: false });
  };

  handleSubmit = e => {
    if (e.key === "Enter") this.endEdit(e);
  };

  render() {
    return [
      <input
        key="input"
        onBlur={this.endEdit}
        type="text"
        value={this.props.value}
        ref={this.inputRef}
        style={{ display: !this.state.editing && "none" }}
        onChange={e => {
          this.props.onChange(e.target.value);
        }}
        onKeyDown={this.handleSubmit}
      />,
      <span
        key="text"
        onDoubleClick={this.beginEdit}
        style={{ display: this.state.editing && "none" }}
      >
        {this.props.value}
      </span>
    ];
  }
}

export default History;
