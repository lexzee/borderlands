import { useState } from "react";
import "./App.css";
import InitGame from "./components/InitGame";

function App() {
  return (
    <>
      {/* Title */}
      <div>
        <h2>Beauty Testing</h2>
        <InitGame />
      </div>
    </>
  );
}

export default App;
