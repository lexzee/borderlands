import { useState } from "react";
import { player_connect } from "@/utils/actions";

function JoinGame() {
  const [gameID, setGameID] = useState(1);
  async function playerJoin(e: any, game_id: number) {
    e.preventDefault();
    const res = await player_connect(game_id);

    console.log(res);
  }
  return (
    <>
      <div>JoinGame</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="number"
            value={gameID}
            onChange={(e: any) => setGameID(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => playerJoin(e, gameID)}>Join</button>
      </form>
    </>
  );
}

export default JoinGame;
