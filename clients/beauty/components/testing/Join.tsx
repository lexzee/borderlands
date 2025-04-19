import { useState } from "react";
import { player_connect } from "@/utils/actions";

function JoinGame() {
  const [gameCode, setGameCode] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  async function playerJoin(e: any, game_code: string, name: string) {
    e.preventDefault();
    const res = await player_connect(game_code, name);

    console.log(res);
  }
  return (
    <>
      <div>Join Game</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="text"
            value={gameCode}
            onChange={(e: any) => setGameCode(e.target.value)}
          />
        </label>
        <label>
          Name:{" "}
          <input
            type="text"
            value={playerName}
            onChange={(e: any) => setPlayerName(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => playerJoin(e, gameCode, playerName)}>
          Join
        </button>
      </form>
    </>
  );
}

export default JoinGame;
