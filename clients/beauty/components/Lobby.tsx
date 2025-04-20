import { use, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { PopUPWithConfirmation, Toast } from "./ui/popup";
import { Input } from "./ui/input";
import { init_game, player_connect } from "@/utils/actions";

// }
interface Player {
  player_id: number;
  name: string;
  status: string;
  score: number;
}

interface Game {
  game_code: string;
  num_players: number;
  status: string;
  players: Player;
  round_data: [];
}

interface Gamex {
  num_players: number;
}

const LobbyScreen: React.FC = () => {
  const [player, setPlayer] = useState<Player>({
    player_id: 5,
    name: "Alice",
    status: "joined",
    score: 0,
  });
  const [isHost, setIsHost] = useState(false);
  const [inGame, setInGame] = useState(false);

  // HandlePopUps and states
  const [showCreatePopUp, setShowCreatePopUp] = useState<boolean>(false);
  const [showJoinPopUp, setShowJoinPopUp] = useState<boolean>(false);
  const [numPlayers, setNumPlayers] = useState<number>(0);
  const [gameCode, setGameCode] = useState<string>("");
  const [game, setGame] = useState<Game>({
    game_code: "htGs34",
    num_players: 5,
    status: "string",
    players: player,
    round_data: [],
  });
  const [playerName, setPlayerName] = useState<string>("");

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

  const joinGame = async (code: string, name: string) => {
    if (gameCode != "") {
      const res = await player_connect(code, name);

      try {
        setPlayer(res);
        setInGame(true);
        displayToast(`You joined game (${code}) as ${name.toWellFormed()}`);
      } catch (error) {
        console.log("Error: " + error);
        displayToast(res.message);
      } finally {
        // displayToast(res.message);
      }

      console.log(res);
    }
  };

  const handleCreateGame = async () => {
    setIsHost(true);
    setInGame(true);
    // Logic coming in
    const res = await init_game(numPlayers);

    try {
      setGameCode(res.game_code);
      setGame(res.game);
      joinGame(res.game_code, playerName);
    } catch (error) {
      console.log("Error: " + error);
    } finally {
      displayToast(res.message);
    }

    setShowCreatePopUp(!showCreatePopUp);
  };

  const handleJoinGame = (e: any) => {
    setIsHost(false);
    setInGame(true);
    // Logic coming in
    joinGame(gameCode, playerName);

    setShowJoinPopUp(!showJoinPopUp);
  };

  const handleReadyToggle = () => {
    setPlayer({
      ...player,
      status: "ready",
    });
  };

  const handleStartGame = () => {};

  // if (!inGame) {
  if (!inGame) {
    return (
      <>
        {showToast && <Toast>{toastMsg}</Toast>}
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-6">
          {/* // <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"> */}
          {showCreatePopUp && (
            <PopUPWithConfirmation
              className=""
              onClose={() => setShowCreatePopUp(false)}
            >
              <h2 className="text-xl font-bold text-center ">Create Game</h2>
              <label htmlFor="player_name">Name</label>
              <Input
                type="text"
                value={playerName}
                id="player_name"
                onChange={(e: any) => setPlayerName(e.target.value)}
              />
              <label htmlFor="num_players">Number of Players</label>
              <Input
                type="number"
                id="num_players"
                value={numPlayers}
                onChange={(e: any) => setNumPlayers(e.target.value)}
              />
              <Button onClick={handleCreateGame}>Create</Button>
            </PopUPWithConfirmation>
          )}
          {showJoinPopUp && (
            <PopUPWithConfirmation
              className=""
              onClose={() => setShowJoinPopUp(false)}
            >
              <h2 className="text-xl font-bold text-center ">Join</h2>
              <label htmlFor="game_code">Name</label>
              <Input
                type="text"
                value={playerName}
                id="player_name"
                onChange={(e: any) => setPlayerName(e.target.value)}
              />

              <label htmlFor="game_code">Game Code</label>
              <Input
                type="text"
                value={gameCode}
                id="game_code"
                onChange={(e: any) => setGameCode(e.target.value)}
              />
              <Button onClick={handleJoinGame}>Join</Button>
            </PopUPWithConfirmation>
          )}
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h1 className="text-2xl font-bold text-center ">Beauty</h1>
              <Button
                className="w-full text blue"
                onClick={() => setShowCreatePopUp(true)}
              >
                Create Game
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowJoinPopUp(true)}
                disabled={inGame && true}
              >
                Join
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 py-6 justify-between">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Beauty</h1>
            <div className="space-y-1">
              <p>
                Game code:{" "}
                <span className="font-bold">
                  {game["game_code"].toUpperCase()}
                </span>
              </p>
              <p className="text-[12px]">
                You {isHost ? "are hosting" : "joined"} the game
              </p>
              <p className="text-[12px] font-light">
                Players Joined: 1 / {game["num_players"]}
              </p>
            </div>
          </CardContent>
          <CardContent className="p-6 space-y-2">
            <h2 className="text-xl font-medium">Players</h2>
            <div className="w-full border-amber-50">
              <div className="flex justify-between text-[13px]">
                <p>You</p>
                {player.status == "joined" ? (
                  <p className="text-orange-400">Not Ready</p>
                ) : (
                  <p className="text-green-500">Ready</p>
                )}
              </div>

              <div className="flex justify-between text-[13px]">
                <p>You</p>
                {player.status == "joined" ? (
                  <p className="text-orange-400">Not Ready</p>
                ) : (
                  <p className="text-green-500">Ready</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {player.status == "joined" && (
          <Button className="bg-green-700" onClick={handleReadyToggle}>
            Ready
          </Button>
        )}

        {isHost && player.status == "ready" && (
          <Button className="bg-blue-800" onClick={handleStartGame}>
            Start Game
          </Button>
        )}
        {!isHost && player.status == "ready" && (
          <p className="font-thin text-sm">Waiting for other players...</p>
        )}
      </div>
    </>
  );
};

export default LobbyScreen;
