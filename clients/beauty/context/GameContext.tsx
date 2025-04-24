"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Player {
  player_id_in_game: number;
  name: string;
  status: string;
  score: number;
  // game_code: string;
}

export interface Game {
  game_code: string;
  num_players: number;
  status: string;
  players: Player[];
  round_data: [];
}

type GameContextType = {
  game: Game;
  player: Player;
  gameCode: string;
  isHost: boolean;
  inGame: boolean;
  setGame: (game: Game) => void;
  setPlayer: (player: Player) => void;
  setGameCode: (gameCode: string) => void;
  setIsHost: (isHost: boolean) => void;
  setInGame: (inGame: boolean) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [game, setGame] = useState<Game>({
    game_code: "",
    num_players: 0,
    status: "",
    players: [],
    round_data: [],
  });
  const [player, setPlayer] = useState<Player>({
    player_id_in_game: 0,
    name: "",
    status: "",
    score: 0,
    // game_code: "",
  });
  const [gameCode, setGameCode] = useState<string>("");
  const [isHost, setIsHost] = useState<boolean>(false);
  const [inGame, setInGame] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    const storedGame = localStorage.getItem("game");
    const storedPlayer = localStorage.getItem("player");
    const storedGameCode = localStorage.getItem("gameCode");
    const storedIsHost = localStorage.getItem("isHost");
    const storedInGame = localStorage.getItem("inGame");

    if (storedGame) setGame(JSON.parse(storedGame));
    if (storedPlayer) setPlayer(JSON.parse(storedPlayer));
    if (storedGameCode) setGameCode(JSON.parse(storedGameCode));
    if (storedIsHost) setIsHost(JSON.parse(storedIsHost));
    if (storedInGame) setInGame(JSON.parse(storedInGame));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (game) localStorage.setItem("game", JSON.stringify(game));
    if (player) localStorage.setItem("player", JSON.stringify(player));
    if (gameCode) localStorage.setItem("gameCode", JSON.stringify(gameCode));
    if (isHost) localStorage.setItem("isHost", JSON.stringify(isHost));
    if (inGame) localStorage.setItem("inGame", JSON.stringify(inGame));
  }, [game, player, gameCode, isHost]);

  // // Optionally fetch missing data here if needed
  // useEffect(() => {
  //   if (!game || !player || !gameCode) {
  //     // Fetch logic here
  //     // You can also extract this into a reusable function
  //     console.log('Missing data — fetch from API if needed');
  //   }
  // }, [game, player, gameCode]);
  return (
    <GameContext.Provider
      value={{
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
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
