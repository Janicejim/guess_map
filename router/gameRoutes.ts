import express from "express";
import { knex } from "../utils/db";
import { isLoggedIn } from "../utils/guard";
import { multerUpload } from "../utils/multer";
import GameService from "../services/gameService";
import GameController from "../controllers/gameController";

const gameRoutes = express.Router();

const gameService = new GameService(knex);
const gameController = new GameController(gameService);

// Game Routes
gameRoutes.get("/games", gameController.getAllActiveGames);
gameRoutes.post("/game", isLoggedIn, multerUpload, gameController.uploadGame);
gameRoutes.get("/game", isLoggedIn, gameController.getSingleGame);
gameRoutes.post("/game/join/:id", isLoggedIn, gameController.joinGame);
gameRoutes.post("/game/play/:id", isLoggedIn, gameController.playGame);
//creator record
gameRoutes.get(
  "/creator/games",
  isLoggedIn,
  gameController.getAllGamesCreateByUser
);

// player status
gameRoutes.get(
  "/game/record/:status",
  isLoggedIn,
  gameController.getUserDifferentGameRecordByStatus
);
gameRoutes.post(
  "/game/like-dislike",
  isLoggedIn,
  gameController.likeOrDislikeGameByPlayer
);
gameRoutes.get(
  "/game/like_dislike",
  isLoggedIn,
  gameController.likeOrDislikeGameRecordByPlayer
);
gameRoutes.get("/rank", gameController.getRank);

export default gameRoutes;
