import "./App.css";
import InitGame from "./components/InitGame";
import JoinGame from "./components/joinGame";
import Ready from "./components/Ready";

function App() {
  return (
    <>
      {/* Title */}
      <div>
        <h2>Beauty Testing</h2>
        <InitGame />
        <JoinGame />
        <Ready />
      </div>
    </>
  );
}

export default App;
