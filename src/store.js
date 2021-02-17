import React from "react";
import reducer from "./reducer.js";

class Store {
  state = reducer();
  observers = [];

  dispatch(action, ...rest) {
    // console.log({ action, ...rest });
    this.state = reducer(this.state, action, ...rest);
    this.observers.forEach(observer => {
      // observer.setState(this.state);
      observer.forceUpdate();
    });
  }
}

const store = new Store();

export default store;

export const observer = ComponentClass => {
  return class extends React.Component {
    constructor() {
      super();
      store.observers.push(this);
    }

    render() {
      return (
        <ComponentClass
          state={store.state}
          dispatch={(action, ...rest) => store.dispatch(action, ...rest)}
          {...ComponentClass.props}
          {...this.props}
        />
      );
    }
  };
};
