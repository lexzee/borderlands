import { useState } from "react";
import { player_ready } from "@/utils/actions";

function Ready() {
  const [gameCode, setGameCode] = useState<string>("");
  const [playerID, setPlayerID] = useState(1);
  async function playerReady(e: any, game_code: string, player_id: number) {
    e.preventDefault();
    const res = await player_ready(game_code, player_id);

    console.log(res);
  }
  return (
    <>
      <div>Ready</div>
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
          Player ID:{" "}
          <input
            type="number"
            value={playerID}
            onChange={(e: any) => setPlayerID(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => playerReady(e, gameCode, playerID)}>
          Ready
        </button>
      </form>
    </>
  );
}

export default Ready;
