import { useState } from "react";
import { round_entry } from "@/utils/actions";

function RoundEntry() {
  const [gameCode, setGameCode] = useState("");
  const [playerID, setPlayerID] = useState<number>(1);
  const [entry, setEntry] = useState<number>(1);
  const [round, setRound] = useState<number>(1);
  async function playerRoundEntry(
    e: any,
    game_code: string,
    player_id: number,
    entry: number
  ) {
    e.preventDefault();
    const res = await round_entry(game_code, player_id, entry, round);

    console.log(res);
  }
  return (
    <>
      <div>RoundEntry</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="string"
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
        <label>
          Entry:{" "}
          <input
            type="number"
            value={entry}
            onChange={(e: any) => setEntry(e.target.value)}
          />
        </label>
        <label>
          Round:{" "}
          <input
            type="number"
            value={round}
            onChange={(e: any) => setRound(e.target.value)}
          />
        </label>

        <button
          onClick={(e: any) => playerRoundEntry(e, gameCode, playerID, entry)}
        >
          Submit
        </button>
      </form>
    </>
  );
}

export default RoundEntry;
