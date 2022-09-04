import React from "react";
import ReactDOM from "react-dom";

// Test widget to display components as popups
class Test extends React.Component {
  state = {
    externalWindow: null,
    containerElement: null,
  };
  componentDidMount() {
    const features = "width=800, height=500, left=300, top=200, menubar=no";
    const externalWindow = window.open("", "", features);

    let containerElement = null;
    if (externalWindow) {
      containerElement = externalWindow.document.createElement("div");
      externalWindow.document.body.appendChild(containerElement);

      // Copy the app's styles into the new window
      const stylesheets = Array.from(document.styleSheets);
      stylesheets.forEach((stylesheet) => {
        const css = stylesheet;

        if (stylesheet.href) {
          const newStyleElement = document.createElement("link");
          newStyleElement.rel = "stylesheet";
          newStyleElement.href = stylesheet.href;
          externalWindow.document.head.appendChild(newStyleElement);
        } else if (css && css.cssRules && css.cssRules.length > 0) {
          const newStyleElement = document.createElement("style");
          Array.from(css.cssRules).forEach((rule) => {
            newStyleElement.appendChild(document.createTextNode(rule.cssText));
          });
          externalWindow.document.head.appendChild(newStyleElement);
        }
      });
    }

    this.setState({
      externalWindow: externalWindow,
      containerElement: containerElement,
    });
  }
  render() {
    if (this.state.containerElement) {
      return ReactDOM.createPortal(
        this.props.children,
        this.state.containerElement
      );
    }
    return null;
  }
}

export default Test;
