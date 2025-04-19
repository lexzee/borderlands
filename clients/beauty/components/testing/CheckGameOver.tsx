import { useState } from "react";
import { check_gameover } from "@/utils/actions";

function CheckGameOver() {
  const [gameID, setGameID] = useState(1);
  async function checkGameOver(e: any, game_id: number) {
    e.preventDefault();
    const res = await check_gameover(game_id);

    console.log(res);
  }
  return (
    <>
      <div>CheckGameOver</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="number"
            value={gameID}
            onChange={(e: any) => setGameID(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => checkGameOver(e, gameID)}>Submit</button>
      </form>
    </>
  );
}

export default CheckGameOver;
