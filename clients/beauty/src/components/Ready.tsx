import { useState } from "react";
import { player_ready } from "../utils/actions";

function Ready() {
  const [gameID, setGameID] = useState(0);
  const [playerID, setPlayerID] = useState(0);
  async function playerReady(e: any, game_id: number, player_id: number) {
    e.preventDefault();
    const res = await player_ready(game_id, player_id);

    console.log(res);
  }
  return (
    <>
      <div>Ready</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="number"
            value={gameID}
            onChange={(e: any) => setGameID(e.target.value)}
          />
        </label>
        <label>
          Player ID:{" "}
          <input
            type="number"
            value={playerID}
            onChange={(e: any) => setPlayerID(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => playerReady(e, gameID, playerID)}>
          Join
        </button>
      </form>
    </>
  );
}

export default Ready;
