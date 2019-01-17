import React, { Component } from 'react';

import './App.css';

import Interpreter from "./components/InterpreterView";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Interpreter/>
      </div>
    );
  }
}

export default App;
