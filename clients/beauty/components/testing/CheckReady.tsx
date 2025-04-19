import { useState } from "react";
import { check_ready } from "@/utils/actions";

function CheckReady() {
  const [gameID, setGameID] = useState(1);
  async function checkReady(e: any, game_id: number) {
    e.preventDefault();
    const res = await check_ready(game_id);

    console.log(res);
  }
  return (
    <>
      <div>CheckReady</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="number"
            value={gameID}
            onChange={(e: any) => setGameID(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => checkReady(e, gameID)}>Check Ready</button>
      </form>
    </>
  );
}

export default CheckReady;
