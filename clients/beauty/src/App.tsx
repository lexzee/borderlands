import "./App.css";
import CheckReady from "./components/CheckReady";
import InitGame from "./components/InitGame";
import JoinGame from "./components/joinGame";
import Ready from "./components/Ready";
import RoundEntry from "./components/RoundEntry";

function App() {
  return (
    <>
      {/* Title */}
      <div>
        <h2>Beauty Testing</h2>
        <InitGame />
        <JoinGame />
        <Ready />
        <CheckReady />
        <RoundEntry />
      </div>
    </>
  );
}

export default App;
