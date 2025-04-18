import { useState } from "react";
import { disqualify } from "../utils/actions";

function CheckDisqualify() {
  const [gameID, setGameID] = useState(1);
  async function checkDisqualify(e: any, game_id: number) {
    e.preventDefault();
    const res = await disqualify(game_id);

    console.log(res);
  }
  return (
    <>
      <div>CheckDisqualify</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="number"
            value={gameID}
            onChange={(e: any) => setGameID(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => checkDisqualify(e, gameID)}>Submit</button>
      </form>
    </>
  );
}

export default CheckDisqualify;
