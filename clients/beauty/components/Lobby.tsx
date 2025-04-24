import io from "socket.io-client";
import { use, useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { PopUPWithConfirmation, Toast } from "./ui/popup";
import { Input } from "./ui/input";
import {
  check_ready,
  get_game,
  init_game,
  player_connect,
  player_ready,
  start_game,
} from "@/utils/actions";
import { useGame } from "@/context/GameContext";
import { useRouter } from "next/navigation";

// const host = "http://127.0.0.1:5000";
const host = process.env.NEXT_PUBLIC_HOST;
const socket = io(host);

interface Player {
  player_id_in_game: number;
  name: string;
  status: string;
  score: number;
}

interface Game {
  game_code: string;
  num_players: number;
  status: string;
  players: Player[];
  round_data: [];
}

const LobbyScreen: React.FC = () => {
  const {
    game,
    player,
    gameCode,
    isHost,
    inGame,
    setGame,
    setPlayer,
    setGameCode,
    setIsHost,
    setInGame,
  } = useGame();

  const router = useRouter();

  // popups
  const [showCreatePopUp, setShowCreatePopUp] = useState<boolean>(false);
  const [showJoinPopUp, setShowJoinPopUp] = useState<boolean>(false);
  const [numPlayers, setNumPlayers] = useState<number>(0);
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

      if (!("error" in res)) {
        setPlayer(res);
        console.log(res);

        setInGame(true);
        displayToast(`You joined game (${code}) as ${name.toWellFormed()}`);
        socket.emit("join_room", code);

        await getGames(code);
        return true;
      } else {
        displayToast(res.error);
        return false;
      }
    }
  };

  const handleCreateGame = async () => {
    setIsHost(true);

    const res = await init_game(numPlayers, playerName);

    if (!("error" in res)) {
      setGameCode(res.game_code);
      setGame(res.game);
      setPlayer(res.game.players[0]);
      displayToast(res.message);
      setShowCreatePopUp(!showCreatePopUp);
      setInGame(true);
      socket.emit("join_room", res.game_code);
    } else {
      displayToast(res.error);
    }
  };

  const handleJoinGame = async (e: any) => {
    if (gameCode != "") {
      const res = await player_connect(gameCode, playerName);

      if (!("error" in res)) {
        setPlayer(res);
        console.log(res);

        setInGame(true);
        displayToast(
          `You joined game (${gameCode}) as ${playerName.toWellFormed()}`
        );
        socket.emit("join_room", gameCode);

        await getGames(gameCode);
        setShowJoinPopUp(!showJoinPopUp);
        return true;
      } else {
        displayToast(res.error);
        return false;
      }
    }
  };

  const handleReady = async () => {
    // const res = await ready(gameCode, player.player_id_in_game);
    const res = await player_ready(gameCode, player.player_id_in_game);

    !("error" in res) ? await getGames(gameCode) : displayToast(res.error);

    // !("error" in res)
  };

  const handleStartGame = async () => {
    const res = await check_ready(game.game_code);
    if (!("error" in res)) {
      if (res["message"] === "True") {
        await start(game.game_code);
        console.log("game Started");
        displayToast("Game Started");
        // router.push("/game");
      } else {
        console.log("Not all players are ready!");
        displayToast("Not all players are ready!");
      }
    }
  };

  const getGames = async (code: string) => {
    const res = await get_game(code);

    if (!("error" in res)) {
      setGame(res);
      res.players.map((p: Player) =>
        p.player_id_in_game === player.player_id_in_game ? setPlayer(p) : null
      );
    } else {
      displayToast(res.error);
    }
  };

  const start = async (code: string) => {
    const res = await start_game(code);
    if (!res.error) {
      setGame(res);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      displayToast("Conected to server");
    });
  }, []);

  useEffect(() => {
    if (gameCode == "") return;

    const handlePlayerJoined = async (data: any) => {
      displayToast(`Player ${data.name} joined the game!`);

      await getGames(gameCode);
    };

    const handlePlayerReady = async (data: any) => {
      displayToast(`Player ${data.name} is ready!`);
      data.player_id_in_game === player.player_id_in_game && setPlayer(data);

      await getGames(gameCode);
    };

    const handleGameStart = async (data: any) => {
      displayToast(`${data}`);
      await getGames(gameCode);
    };

    const handleConnect = () => {
      const storedGame = localStorage.getItem("gameCode");
      if (storedGame) {
        socket.emit("join_room", storedGame);
        console.log(`Rejoined room: ${storedGame}`);
        displayToast(`Rejoined room: ${storedGame}`);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("player_joined", handlePlayerJoined);
    socket.on("player_ready", handlePlayerReady);
    socket.on("game_started", handleGameStart);
    socket.emit("join_room", gameCode);

    return () => {
      socket.off("player_joined", handlePlayerJoined);
      socket.off("player_ready", handlePlayerReady);
      socket.off("game_started", handleGameStart);
      socket.off("connect", handleConnect);
    };
  }, [gameCode, player]);

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

  const displayStartButton = () => {
    if (player.status == "joined") {
      return (
        <Button className="bg-green-700" onClick={handleReady}>
          Ready
        </Button>
      );
    } else if (player.status == "ready") {
      if (isHost) {
        return (
          <Button className="bg-blue-800" onClick={handleStartGame}>
            Start Game
          </Button>
        );
      }

      return <p className="font-thin text-sm">Waiting for other players...</p>;
    }
  };
  return (
    <>
      {showToast && <Toast>{toastMsg}</Toast>}
      <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 py-6 justify-between">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Beauty</h1>
            <div className="space-y-1">
              <p>
                Game code:{" "}
                <span className="font-bold">
                  {/* {game["game_code"].toUpperCase()} */}
                  {gameCode.toUpperCase()}
                </span>
              </p>
              <p className="text-[12px]">
                You {isHost ? "are hosting" : "joined"} the game
              </p>
              <p className="text-[12px] font-light">
                Players Joined: {game.players.length} / {game["num_players"]}
              </p>
            </div>
          </CardContent>
          <CardContent className="p-6 space-y-2">
            <h2 className="text-xl font-medium">Players</h2>
            <div className="w-full border-amber-50">
              {game.players.map((p) => (
                <div
                  className="flex justify-between text-[13px]"
                  key={p.player_id_in_game}
                >
                  <p>
                    {p.player_id_in_game === player.player_id_in_game
                      ? "You"
                      : p.name}
                  </p>
                  {p.status == "joined" ? (
                    <p className="text-orange-400">Not Ready</p>
                  ) : (
                    <p className="text-green-500">Ready</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {displayStartButton()}
      </div>
    </>
  );
};

export default LobbyScreen;
