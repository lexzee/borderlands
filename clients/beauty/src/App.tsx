import "./App.css";
import CheckDisqualify from "./components/CheckDisqualify";
import CheckGameOver from "./components/CheckGameOver";
import CheckReady from "./components/CheckReady";
import InitGame from "./components/InitGame";
import JoinGame from "./components/joinGame";
import ProcessRound from "./components/ProcessRound";
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
        <ProcessRound />
        <CheckDisqualify />
        <CheckGameOver />
      </div>
    </>
  );
}

export default App;
