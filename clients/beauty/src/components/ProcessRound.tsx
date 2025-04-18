import { useState } from "react";
import { process_round } from "../utils/actions";

function ProcessRound() {
  const [gameID, setGameID] = useState(1);
  async function playerProcessRound(e: any, game_id: number) {
    e.preventDefault();
    const res = await process_round(game_id);

    console.log(res);
  }
  return (
    <>
      <div>ProcessRound</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="number"
            value={gameID}
            onChange={(e: any) => setGameID(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => playerProcessRound(e, gameID)}>
          Submit
        </button>
      </form>
    </>
  );
}

export default ProcessRound;
