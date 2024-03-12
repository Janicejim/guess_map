import express from "express";

import { isLoggedIn } from "../utils/guard";
import { multerUpload } from "../utils/multer";
import { gameController } from "../server";

const gameRoutes = express.Router();

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
gameRoutes.get("/score/record", isLoggedIn, gameController.getUserScoreRecord);
gameRoutes.get("/game/completed", gameController.getCompletedGamesForCheckIn);
export default gameRoutes;
