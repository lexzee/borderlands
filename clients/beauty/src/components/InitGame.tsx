import { useState } from "react";
import { init_game } from "../utils/actions";

function InitGame() {
  const [no_players, setNoPlayers] = useState(1);

  async function createGame(e: any) {
    e.preventDefault();
    const res = await init_game(no_players);

    console.log(res);
  }

  return (
    <>
      <div>InitGame</div>
      <form>
        <label>
          Number of players:{" "}
          <input
            type="number"
            value={no_players}
            onChange={(e: any) => setNoPlayers(e.target.value)}
          />
        </label>

        <button onClick={createGame}>Create</button>
      </form>
    </>
  );
}

export default InitGame;
