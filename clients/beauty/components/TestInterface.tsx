import React from "react";
import InitGame from "./testing/InitGame";
import JoinGame from "./testing/Join";
import Ready from "./testing/Ready";
import CheckReady from "./testing/CheckReady";
import CheckDisqualify from "./testing/CheckDisqualify";
import CheckGameOver from "./testing/CheckGameOver";

const TestInterface = () => {
  return (
    <div className="flex flex-col items-center p-8 min-h-screen justify-center gap-2">
      <h1 className="textBold">API Test</h1>
      <InitGame />
      <JoinGame />
      <Ready />
      <CheckReady />
      <CheckDisqualify />
      <CheckGameOver />
    </div>
  );
};

export default TestInterface;
