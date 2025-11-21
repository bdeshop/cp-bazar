import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const PlayGame = () => {
  const { id } = useParams();
  const [gameLink, setGameLink] = useState(null);
  const [error, setError] = useState(null);
  const [orientation, setOrientation] = useState("landscape");
  const [isUserDataFetched, setIsUserDataFetched] = useState(false);
  const [isGameLinkFetched, setIsGameLinkFetched] = useState(false);
  const [loading, setLoading] = useState(true); // iframe loading state
  const [loadingLINK, setLoadingLINK] = useState(true); // fetch link loading state
  const [games, setGames] = useState(null);
  const [isGamesLoading, setIsGamesLoading] = useState(true);
  const [isGamesError, setIsGamesError] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isUserError, setIsUserError] = useState(false);
  const [gameUUID, setGameUUID] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [balance, setBalance] = useState(null);
  const videoRef = useRef(null);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    if (id && id.length === 24) {
      setGameId(id);
    }
  }, [id]);

  // Fetch games and user data
  useEffect(() => {
    if (gameId && user) {
      console.log("Calling fetchGames with:", { gameId, user });

      fetchGames(gameId, user);
    }
  }, [gameId, user]);

  const fetchGames = async (gameId, user) => {
    setIsGamesLoading(true);
    setIsUserDataFetched(true);

    console.log("Inside fetchGames with URL params:", `${gameId}/${user._id}`);

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API
        }api/v1/frontend/get-the-game/${gameId}/${user._id}`
      );
      const data = await res.json();

      console.log("Fetched game data:", data);

      if (data.success) {
        setGameUUID(data.game_uuid);
        setGames(data.data);
        setUserData(data.data?.user);
        setBalance(data.data?.user?.balance);
        setIsUserDataFetched(false);
        setIsGamesError(false);
      } else {
        throw new Error(data.message || "Failed to fetch game data");
      }
    } catch (err) {
      console.error("Error fetching games:", err.message);
      setIsGamesError(true);
      setError(err.message || "Failed to fetch games");
    } finally {
      setIsGamesLoading(false);
    }
  };

  // Check for iframe content and loading state
  useEffect(() => {
    if (!videoRef.current || !gameLink) return;

    console.log("GAME: start");
    setLoading(true);

    const checkIframeText = () => {
      try {
        const iframeDocument =
          videoRef.current.contentDocument ||
          videoRef.current.contentWindow.document;
        const bodyText = iframeDocument.body?.innerText || "";
        const containsText = bodyText.includes("TurnkeyXGaming");

        if (containsText) {
          console.log("GAME: start (TurnkeyXGaming found)");
        } else {
          console.log("GAME: end 1 (TurnkeyXGaming not found)");
          clearInterval(interval);
        }
      } catch (error) {
        console.warn(
          "Cannot access iframe content due to cross-origin restrictions:",
          error
        );
      }
    };

    const handleIframeLoad = () => {
      console.log("GAME: end 2 (iframe loaded)");
      clearInterval(interval);
    };

    videoRef.current.addEventListener("load", handleIframeLoad);

    const interval = setInterval(checkIframeText, 1000);

    const fallbackTimer = setTimeout(() => {
      console.log("GAME: end 3 (fallback timer)");
      setLoading(false);
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
      if (videoRef.current) {
        videoRef.current.removeEventListener("load", handleIframeLoad);
      }
    };
  }, [gameLink]);

  // Log loading states for debugging
  useEffect(() => {
    console.log("Loading states:", { loading, loadingLINK });
  }, [loading, loadingLINK]);

  // Auto set orientation based on screen width
  useEffect(() => {
    const updateOrientation = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setOrientation("portrait");
      } else if (width < 1024) {
        setOrientation("rotate");
      } else {
        setOrientation("landscape");
      }
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    return () => window.removeEventListener("resize", updateOrientation);
  }, []);

  // Fetch game link when userData and gameUUID are available
  useEffect(() => {
    const fetchGameLink = async () => {
      // console.log("Attempting to fetch game link with:", {
      //   gameUUID,
      //   balance: userData?.balance,
      //   username: userData?.email,
      //   userData,
      // });

      // if (!gameUUID || !userData?.balance || !userData?.email) {
      //   console.error("Missing required data for game link:", {
      //     gameUUID,
      //     balance: userData?.balance,
      //     username: userData?.email,
      //   });
      //   setError("Missing game UUID, balance, or username");
      //   setIsGameLinkFetched(true);
      //   setLoadingLINK(false);
      //   return;
      // }

      setError(null);
      setLoadingLINK(true);

      try {
        const token = localStorage.getItem("token");
        console.log("Token for game link:", token ? "Token found" : "No token");

        if (!token) {
          throw new Error("No token found in localStorage");
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API}api/v1/frontend/playGame`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              gameID: gameUUID, // Changed to game_id to match potential backend convention
              money: parseInt(userData.balance, 10),
              username: userData.email, // Using email as username as per your latest code
            }),
          }
        );

        const data = await response.json();
        console.log("Game link API response:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch game link");
        }

        const link = data.joyhobeResponse || data.gameLink || data.link; // Fallbacks for different response formats
        if (link) {
          setGameLink(link);
          console.log("Game link set successfully:", link);
        } else {
          throw new Error("Game link not found in response");
        }
      } catch (error) {
        console.error("Error fetching game link:", error.message);
        setError(error.message);
      } finally {
        setLoadingLINK(false);
        setIsGameLinkFetched(true);
      }
    };

    if (gameUUID && userData) {
      fetchGameLink();
    }
  }, [gameUUID, userData]);

  // Check for loader-container1 in iframe content
  useEffect(() => {
    if (!videoRef.current || !gameLink) return;

    const checkIframeLoader = () => {
      try {
        const iframeDocument =
          videoRef.current.contentDocument ||
          videoRef.current.contentWindow.document;
        const loaderContainer =
          iframeDocument.querySelector(".loader-container1");

        if (!loaderContainer) {
          console.log(
            "GAME: Loader-container1 not found, stopping loading state"
          );
        }
      } catch (error) {
        console.warn(
          "GAME: Cannot access iframe content due to cross-origin restrictions:",
          error
        );
        setTimeout(() => {
          console.log("GAME: Fallback: Stopping loading state after timer");
          setLoading(false);
        }, 5000);
      }
    };

    const interval = setInterval(checkIframeLoader, 1000);

    return () => clearInterval(interval);
  }, [gameLink]);

  // Show loading state while games are being fetched
  if (isGamesLoading) {
    return (
      <div className="loader-container fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-100 z-50">
        <div className="flex flex-col items-center justify-center">
          <div className="loader relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-bounce">
            Loading Game
          </h2>
          <p className="text-lg font-semibold text-blue-600">
            www.oracleapi.net
          </p>
          <p className="mt-2 text-lg font-semibold text-blue-600">
            গেম লোড হচ্ছে অপেক্ষা করুন...
          </p>
        </div>
      </div>
    );
  }

  // Show error if games fetch failed
  if (isGamesError) {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-[100vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
          <p className="font-semibold">গেম ডেটা লোড করতে ব্যর্থ হয়েছে!</p>
          <p className="text-sm">দয়া করে পরে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }

  // Show "Game not found" error only after games are loaded
  if (error && !isGameLinkFetched) {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-[100vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
          <p className="font-semibold">গেম পাওয়া যায়নি!</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show error only after user data or game link fetch fails
  if ((isUserError && isUserDataFetched) || (error && isGameLinkFetched)) {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-[100vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
          <p className="font-semibold">একটি ত্রুটি ঘটেছে!</p>
          <p className="text-sm">{error || "Failed to fetch user data"}</p>
        </div>
      </div>
    );
  }

  // Show "Game link not found" warning only after game link fetch is complete
  if (!gameLink && isGameLinkFetched) {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-[100vh]">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md shadow-md">
          <p className="font-semibold">গেম লিঙ্ক পাওয়া যায়নি!</p>
          <p className="text-sm">দয়া করে পরে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${
        orientation === "portrait"
          ? "h-[100vh]"
          : orientation === "rotate"
          ? "h-[80vh]"
          : "h-[650px]"
      } bg-white overflow-hidden`}
    >
      <iframe
        ref={videoRef}
        className="w-full h-full fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-100 z-50"
        src={gameLink}
        frameBorder="0"
        title={id}
        allowFullScreen
      ></iframe>

      {(loading || loadingLINK) && (
        <div className="loader-container fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-100 z-50">
          <div className="flex flex-col items-center justify-center">
            <div className="loader relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-bounce">
              Loading Game
            </h2>
            <p className="text-lg font-semibold text-blue-600">
              www.oracleapi.net
            </p>
            <p className="mt-2 text-lg font-semibold text-blue-600">
              গেম লোড হচ্ছে অপেক্ষা করুন...
            </p>
          </div>
        </div>
      )}
      <style>
        {`
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }

          .animate-pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }

          .animate-bounce {
            animation: bounce 2s ease-in-out infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 0.9; }
            100% { transform: scale(1); opacity: 0.7; }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );
};

export default PlayGame;
