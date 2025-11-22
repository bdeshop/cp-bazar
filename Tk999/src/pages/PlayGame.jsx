import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import axios from "axios";

const PlayGame = () => {
  const { id } = useParams(); // এটা gameID
  const { user, balance } = useContext(AuthContext);

  const [gameUrl, setGameUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const launchGame = async () => {
      try {
        if (!user) {
          alert("Please login first!");
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_API}playgame`,
          {
            gameID: id,
            username: user.username,
            money: balance || 0,
          }
        );

        console.log(response);

        const url = response.data.gameUrl;

        if (url) {
          setGameUrl(url);
        } else {
          alert("Game URL not received!");
        }
      } catch (error) {
        console.error("Game launch failed:", error);
        alert("Failed to load game. Try again.");
      } finally {
        setLoading(false);
      }
    };

    launchGame();
  }, [id, user, balance]);

  // Loading Screen
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        <div>গেম লোড হচ্ছে...</div>
        <div style={{ marginTop: "20px", fontSize: "36px" }}>Please Wait</div>
      </div>
    );
  }

  // গেম লোড হলে Full Screen iframe
  return (
    <div className="min-h-screen">
      <h1>Play game server DST GAMING PROBLEM</h1>
    </div>
  );
};

export default PlayGame;
