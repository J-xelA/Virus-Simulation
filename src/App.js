import React from "react";
import Sketch from "react-p5";
import {
  setup,
  draw,
} from "./P5Sketch";

import './App.css';
import './style.css';

let VirusSim = () => {
  return (
    <div>
      <Sketch
        setup = {(p5, canvasParentRef) => setup(p5, canvasParentRef)}
        draw = {(p5) => draw(p5)}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <h1>Virus Simulation</h1>
      <div>
        <h3 id="healthy">Healthy:</h3>
        <h3 id="infected">Infected:</h3>
      </div>
      <VirusSim />
    </div>
  );
}

export default App