import { useState } from "react";
import { check_ready } from "@/utils/actions";

function CheckReady() {
  const [gameCode, setGameCode] = useState<string>("");
  async function checkReady(e: any, game_code: string) {
    e.preventDefault();
    const res = await check_ready(game_code);

    console.log(res);
  }
  return (
    <>
      <div>CheckReady</div>
      <form>
        <label>
          Game ID:{" "}
          <input
            type="string"
            value={gameCode}
            onChange={(e: any) => setGameCode(e.target.value)}
          />
        </label>

        <button onClick={(e: any) => checkReady(e, gameCode)}>
          Check Ready
        </button>
      </form>
    </>
  );
}

export default CheckReady;
