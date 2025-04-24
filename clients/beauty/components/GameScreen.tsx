import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { check_ready, games, get_game, round_entry } from "@/utils/actions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Toast } from "./ui/popup";
import { Game } from "@/context/GameContext";

interface GameProp extends React.InputHTMLAttributes<HTMLInputElement> {}

const GameScreen: React.FC = () => {
  const [game, setGame] = useState<Game>();
  const [currentGame, setCurrentGame] = useState("jl7s5i");
  const [currentPlayer, setCurrentPlayer] = useState({
    player_id: 1,
  });
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [entry, setEntry] = useState<number>(1);
  const [round, setRound] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const intervalRef = useRef<number | null>(null);

  // for toast
  const [toastMsg, setToastMessage] = useState<string | number | null>();
  const [showToast, setShowToast] = useState(false);
  const displayToast = (text: string | number | null) => {
    setShowToast(true);
    setToastMessage(text);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage(text);
    }, 1500);
  };

  useEffect(() => {
    const getGames = async () => {
      try {
        const res = await get_game(currentGame);

        setGame(res);
      } catch (error) {
        console.log(error);
      }
    };

    getGames();
  }, [currentGame]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      console.log("Countdown Finished");

      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          console.log("Countdown finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleSumbitEntry = async () => {
    if (game) {
      const res = await round_entry(
        game.game_code,
        currentPlayer.player_id,
        entry,
        round
      );
      console.log(res);

      setRound(round + 1);
      setIsRunning(false);
      // setHasSubmitted(!hasSubmitted);
    }
  };

  return (
    <>
      {showToast && <Toast>{toastMsg}</Toast>}
      <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 py-6 space-y-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-2 flex justify-between items-center">
            <h1>Round {round}</h1>
            <p className="text-sm font-extralight">Time Left: {timeLeft}s</p>
          </CardContent>
        </Card>

        {game && (
          <Card className="w-full max-w-md">
            <CardContent className="p-2 grid grid-cols-2 gap-4">
              {game.players.map((player) => (
                <div
                  key={player.player_id_in_game}
                  className="flex justify-between items-center px-3 py-2 border min-h-4 rounded-md text-md"
                >
                  <p>
                    {player.player_id_in_game == currentPlayer.player_id
                      ? "You"
                      : player.name}
                  </p>
                  <p className="font-light">{player.score}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="w-full max-w-md">
          {!hasSubmitted ? (
            <CardContent className="p-2 flex flex-col justify-between space-y-3 items-center">
              <label htmlFor="entry">Enter a number between 1 and 100</label>
              <Input
                id="entry"
                type="number"
                value={entry}
                onChange={(e: any) => setEntry(e.target.value)}
              />
              <Button className="w-full" onClick={handleSumbitEntry}>
                Submit
              </Button>
            </CardContent>
          ) : (
            <CardContent className="p-2 flex flex-col  items-center">
              <p className="font-light">Waiting for other players...</p>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

export default GameScreen;
