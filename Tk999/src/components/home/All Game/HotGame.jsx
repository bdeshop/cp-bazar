import { useState, useEffect } from "react";
import GameCard from "../gameCard/GameCard";
import { baseURL_For_IMG_UPLOAD } from "@/utils/baseURL";

const HotGame = ({ allHotGames }) => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    // Check if allHotGames is an array and has at least one item
    if (Array.isArray(allHotGames) && allHotGames.length > 0) {
      const formattedGames = allHotGames.flatMap((hotGame) =>
        hotGame.games.filter((game) => game.isHotGame === true)
      );
      setGames(formattedGames);
    } else {
      setGames([]); // Set empty array if no valid data
    }
  }, [allHotGames]);

  useEffect(() => {}, [allHotGames]);

  // Handle empty or loading state
  if (!Array.isArray(allHotGames) || allHotGames.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No hot games available.</p>
      </div>
    );
  }

  return (
    <div>
      <GameCard
        title="Hot Games"
        parentId={"Hot Games"}
        parentMenu={allHotGames[0]?.parentMenuOption?.title || "Unknown"}
        games={games}
      />
    </div>
  );
};

export default HotGame;
