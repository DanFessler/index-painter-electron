import React from "react";

class Window extends React.Component {
  componentDidMount() {
    for (const property in this.props.events) {
      window.addEventListener(property, this.props.events[property]);
    }
  }
  componentWillUnmount() {
    for (const property in this.props.events) {
      window.removeEventListener(property, this.props.events[property]);
    }
  }
  render() {
    return <>{this.props.children}</>;
  }
}

export default Window;
