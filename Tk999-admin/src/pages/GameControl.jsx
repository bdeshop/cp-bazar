import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { FaPlus, FaTimes, FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import {
  createGame,
  fetchGames,
  updateGame,
  deleteGame,
} from "../redux/Frontend Control/GameControl/GameControlAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  baseURL,
  baseURL_For_IMG_DELETE,
  baseURL_For_IMG_UPLOAD,
} from "../utils/baseURL";
import axios from "axios";

// Styled Components
const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  margin-top: 10px;
  border-radius: 4px;
`;
const Container = styled.div`
  padding: 20px;
`;
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const DialogBox = styled.div`
  background: white;
  max-width: 500px;
  width: 90%;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #6c757d;
  &:hover {
    color: #343a40;
  }
`;
const FormGroup = styled.div`
  margin-bottom: 1rem;
`;
const GameList = styled.div`
  margin-top: 20px;
`;
const GameCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
`;
const GameImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;
const GameContent = styled.div`
  padding: 15px;
`;
const GameTitle = styled.h5`
  margin-bottom: 10px;
  font-size: 1.25rem;
`;

const GameControl = () => {
  const dispatch = useDispatch();
  const { gameControl, isLoading, isError, errorMessage } = useSelector(
    (state) => state.gameControl
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    gameAPIID: "",
    subOptionId: "",
    imageFile: null,
    imageUrl: "",
    isHotGame: false,
  });

  const [submenuProviders, setSubmenuProviders] = useState([]);
  const [apiGames, setApiGames] = useState([]);
  const [selectedSubmenu, setSelectedSubmenu] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingGameId, setEditingGameId] = useState(null);
  const [apiGamesState, setApiGamesState] = useState({});

  const API_KEY =
    "300cc0adfcfb041c25c4a8234e3c0e312a44c7570677d64bdb983412f045da67";

  useEffect(() => {
    const fetchSubmenuProviders = async () => {
      try {
        const response = await axios.get(`${baseURL}/submenu-providers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (response.data.success) {
          setSubmenuProviders(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch submenu providers:", error);
        toast.error("Failed to fetch providers.");
      }
    };
    fetchSubmenuProviders();
    dispatch(fetchGames());
  }, [dispatch]);

  const handleProviderChange = async (submenuId) => {
    setSelectedSubmenu(submenuId);
    setApiGames([]);
    setApiGamesState({});

    if (submenuId) {
      const selected = submenuProviders.find((s) => s._id === submenuId);
      if (selected && selected.providerId) {
        try {
          const response = await axios.get(
            `https://apigames.oracleapi.net/api/games/pagination?page=1&limit=50&provider=${selected.providerId}`,
            { headers: { "x-api-key": API_KEY } }
          );
          if (response.data.success) {
            setApiGames(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch games:", error);
          toast.error("Failed to fetch games for this provider.");
        }
      }
    }
  };

  const handleApiGameImageUpload = async (e, gameAPIID) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const response = await fetch(baseURL_For_IMG_UPLOAD, {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Image upload failed");

      setApiGamesState((prev) => ({
        ...prev,
        [gameAPIID]: { ...prev[gameAPIID], imageUrl: data.imageUrl },
      }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApiGameHotToggle = (gameAPIID) => {
    setApiGamesState((prev) => ({
      ...prev,
      [gameAPIID]: {
        ...prev[gameAPIID],
        isHotGame: !prev[gameAPIID]?.isHotGame,
      },
    }));
  };

  const handleSaveApiGame = async (gameAPIID) => {
    const gameState = apiGamesState[gameAPIID];
    if (!gameState || !gameState.imageUrl) {
      toast.error("Please upload an image before saving.");
      return;
    }

    try {
      await dispatch(
        createGame({
          gameAPIID,
          subOptions: selectedSubmenu,
          image: gameState.imageUrl,
          isHotGame: gameState.isHotGame || false,
        })
      ).unwrap();
      toast.success("Game saved successfully!");
      dispatch(fetchGames());
    } catch (error) {
      toast.error(error.message || "Failed to save game.");
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleEditImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("image", file);
      const response = await fetch(baseURL_For_IMG_UPLOAD, {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Image upload failed");
      setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (error) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleEditSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!editingGameId) return;

      try {
        await dispatch(
          updateGame({ id: editingGameId, data: formData })
        ).unwrap();
        toast.success("Game updated successfully!");
        closeDialog();
        dispatch(fetchGames());
      } catch (error) {
        toast.error(error.message || "Failed to update game.");
      }
    },
    [dispatch, formData, editingGameId]
  );

  const handleDeleteGame = useCallback(
    async (gameId, imageFilename) => {
      try {
        if (imageFilename) {
          await fetch(baseURL_For_IMG_DELETE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: imageFilename }),
          });
        }
        await dispatch(deleteGame(gameId)).unwrap();
        toast.success("Game deleted successfully!");
        dispatch(fetchGames());
      } catch (error) {
        toast.error(error.message || "Failed to delete game.");
      }
    },
    [dispatch]
  );

  const handleEditGame = (game) => {
    setEditingGameId(game._id);
    setFormData({
      gameAPIID: game.gameAPIID,
      subOptionId: game.subOptions?._id || "",
      imageUrl: game.image,
      isHotGame: game.isHotGame || false,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingGameId(null);
    setFormData({
      gameAPIID: "",
      subOptionId: "",
      imageUrl: "",
      isHotGame: false,
    });
  };

  // Find saved game data for a provider game
  const getSavedGameData = (gameAPIID) => {
    return gameControl.find((savedGame) => savedGame.gameAPIID === gameAPIID);
  };

  return (
    <Container className="container">
      <FormGroup>
        <label htmlFor="provider" className="form-label">
          Select a Provider (Submenu)
        </label>
        <select
          id="provider"
          value={selectedSubmenu}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="form-select"
        >
          <option value="">-- Select Provider --</option>
          {submenuProviders.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.providerName}
            </option>
          ))}
        </select>
      </FormGroup>

      <hr />
      <h2>Games from Provider</h2>
      <GameList className="row g-4">
        {isLoading && (
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {isError && (
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {errorMessage || "Failed to load games"}
            </div>
          </div>
        )}
        {apiGames.length === 0 && !isLoading && !isError && (
          <p>Select a provider to see available games.</p>
        )}
        {apiGames.map((game) => {
          const savedGame = getSavedGameData(game._id);
          const isSaved = !!savedGame;
          const displayGame = isSaved ? savedGame : game;
          const displayImage = isSaved
            ? `${baseURL_For_IMG_UPLOAD}s/${displayGame.image}`
            : apiGamesState[game._id]?.imageUrl
            ? `${baseURL_For_IMG_UPLOAD}s/${apiGamesState[game._id].imageUrl}`
            : game.image;
          const isHotGame = isSaved
            ? displayGame.isHotGame
            : apiGamesState[game._id]?.isHotGame || false;

          return (
            <div key={game._id} className="col-md-6 col-lg-3">
              <GameCard className="card h-100">
                <GameImage src={displayImage} alt={game.name} />
                <GameContent>
                  <GameTitle className="card-title">{game.name}</GameTitle>
                  <p className="card-text">
                    Hot Game: {isHotGame ? "Yes" : "No"}
                  </p>
                  {!isSaved && (
                    <>
                      <FormGroup>
                        <label
                          htmlFor={`image-upload-${game._id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <FaUpload />{" "}
                          {apiGamesState[game._id]?.imageUrl
                            ? "Change Image"
                            : "Upload Image"}
                        </label>
                        <input
                          type="file"
                          id={`image-upload-${game._id}`}
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleApiGameImageUpload(e, game._id)
                          }
                        />
                        {apiGamesState[game._id]?.imageUrl && (
                          <ImagePreview
                            src={`${baseURL_For_IMG_UPLOAD}s/${
                              apiGamesState[game._id].imageUrl
                            }`}
                          />
                        )}
                      </FormGroup>
                      <FormGroup className="form-check">
                        <input
                          type="checkbox"
                          id={`hot-toggle-${game._id}`}
                          className="form-check-input"
                          checked={apiGamesState[game._id]?.isHotGame || false}
                          onChange={() => handleApiGameHotToggle(game._id)}
                        />
                        <label
                          htmlFor={`hot-toggle-${game._id}`}
                          className="form-check-label"
                        >
                          Hot Game
                        </label>
                      </FormGroup>
                      <button
                        className="btn btn-success w-100"
                        onClick={() => handleSaveApiGame(game._id)}
                        disabled={isUploading}
                      >
                        Save to My Games
                      </button>
                    </>
                  )}
                  {isSaved && (
                    <div className="d-flex gap-2 mt-2">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEditGame(savedGame)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleDeleteGame(savedGame._id, savedGame.image)
                        }
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </GameContent>
              </GameCard>
            </div>
          );
        })}
      </GameList>

      {isDialogOpen && (
        <DialogOverlay>
          <DialogBox
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={closeDialog}>
              <FaTimes />
            </CloseButton>
            <h2 className="mb-4">Edit Game</h2>
            <form onSubmit={handleEditSubmit}>
              <FormGroup>
                <label htmlFor="gameAPIID" className="form-label">
                  Game API ID
                </label>
                <input
                  type="text"
                  id="gameAPIID"
                  value={formData.gameAPIID}
                  className="form-control"
                  readOnly
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="subOptionId" className="form-label">
                  Game Category
                </label>
                <select
                  id="subOptionId"
                  name="subOptionId"
                  value={formData.subOptionId}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Game Category</option>
                  {submenuProviders.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.providerName}
                    </option>
                  ))}
                </select>
              </FormGroup>
              <FormGroup className="form-check">
                <input
                  type="checkbox"
                  id="isHotGame"
                  name="isHotGame"
                  checked={formData.isHotGame}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label htmlFor="isHotGame" className="form-check-label">
                  Hot Game
                </label>
              </FormGroup>
              <FormGroup>
                <label htmlFor="gameImage" className="form-label">
                  Game Image
                </label>
                {formData.imageUrl && (
                  <ImagePreview
                    src={`${baseURL_For_IMG_UPLOAD}s/${formData.imageUrl}`}
                    alt="Current game"
                  />
                )}
                <input
                  type="file"
                  id="gameImage"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="form-control"
                  disabled={isUploading}
                />
              </FormGroup>
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading}
                >
                  Update Game
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDialog}
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogBox>
        </DialogOverlay>
      )}
    </Container>
  );
};

export default GameControl;
