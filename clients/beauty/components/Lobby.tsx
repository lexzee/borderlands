import { use, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

// }
interface Player {
  id: string;
  name: string;
  isReady: boolean;
}

const LobbyScreen: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayer] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [inGame, setInGame] = useState(false);

  const handleCreateGame = () => {
    setIsHost(true);
    setInGame(true);
    // Logic coming in
  };

  const handleJoinGame = () => {
    setIsHost(false);
    setInGame(true);
    // Logic coming in
  };

  const hadleReadyToggle = () => {};

  const handleStartGame = () => {};

  if (!inGame) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-6">
        {/* // <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"> */}
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-center ">Beauty</h1>
            <Button className="w-full text blue" onClick={handleCreateGame}>
              Create Game
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleJoinGame}
            >
              Join
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return "";
};

export default LobbyScreen;
