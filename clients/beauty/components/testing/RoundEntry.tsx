import { useState } from "react";
import { round_entry } from "@/utils/actions";

function RoundEntry() {
  const [gameID, setGameID] = useState(1);
  const [playerID, setPlayerID] = useState(1);
  const [entry, setEntry] = useState(1);
  async function playerRoundEntry(
    e: any,
    game_id: number,
    player_id: number,
    entry: number
  ) {
    e.preventDefault();
    const res = await round_entry(game_id, player_id, entry);

    console.log(res);
  }
  return (
    <>
      <div>RoundEntry</div>
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
        <label>
          Entry:{" "}
          <input
            type="number"
            value={entry}
            onChange={(e: any) => setEntry(e.target.value)}
          />
        </label>

        <button
          onClick={(e: any) => playerRoundEntry(e, gameID, playerID, entry)}
        >
          Submit
        </button>
      </form>
    </>
  );
}

export default RoundEntry;
