import { useState } from "react";
import { process_round } from "@/utils/actions";

function ProcessRound() {
  const [gameCode, setGameCode] = useState("");
  const [round, setRound] = useState(1);
  async function playerProcessRound(
    e: any,
    game_code: string,
    round_number: number
  ) {
    e.preventDefault();
    const res = await process_round(game_code, round_number);

    console.log(res);
  }
  return (
    <>
      <div>ProcessRound</div>
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
          Round:{" "}
          <input
            type="text"
            value={round}
            onChange={(e: any) => setRound(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => playerProcessRound(e, gameCode, round)}>
          Submit
        </button>
      </form>
    </>
  );
}

export default ProcessRound;
