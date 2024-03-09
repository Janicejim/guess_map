import GameService from "../services/gameService";
import { Request, Response } from "express";
import { checkDistance } from "../utils/distance";
import { Server as SocketIO } from "socket.io";
class GameController {
  constructor(private gameService: GameService, private io: SocketIO) {}

  //////get game data///////
  getAllActiveGames = async (req: Request, res: Response) => {
    let user_id = req.session.user?.id || 0;
    let results;
    let sorting = req.query.sorting;

    if (!sorting) {
      sorting = `game.created_at desc`;
    } else {
      sorting = sorting.toString().replace(/%20/g, " ");
    }

    if (user_id) {
      results = await this.gameService.getAllActiveGamesByUser(
        user_id,
        sorting
      );
    } else {
      results = (await this.gameService.getAllActiveGames(sorting)).rows;
    }
    if (req.query.limit) {
      results = results.slice(0, req.query.limit);
    }

    res.json(results);
  };

  uploadGame = async (req: Request, res: Response) => {
    try {
      const media = req.file?.filename;
      let {
        targeted_location,
        hints_1,
        hints_2,
        answer_name,
        answer_address,
        answer_description,
      } = req.body;

      let id = req.session["user"].id;

      await this.gameService.createGame({
        user_id: id,
        media,
        target_location: targeted_location,
        answer_name,
        answer_address,
        answer_description,
        hints_1,
        hints_2,
        status: "active",
      });

      res.json({ success: true });
    } catch (err) {
      console.log("error:", err);
      res.json({ success: false, error: err });
    }
  };

  getSingleGame = async (req: Request, res: Response) => {
    try {
      const gameId = req.query.id;

      if (!gameId) {
        res.json("missing query");
        return;
      }
      //check the game status: active,inactive or completed:
      const gameStatus = (await this.gameService.checkGameData(+gameId)).status;

      //get active game data:
      const activeData = await this.gameService.getActiveGameInfo(+gameId);

      //get complete game data:
      const completedData = await this.gameService.getCompletedGameInfo(
        +gameId
      );

      const currentUserId = req.session["user"].id;
      // //check user play this game history:
      const playRecord = await this.gameService.getPlayGameRecord(
        currentUserId,
        +gameId
      );
      const isCreator = await this.gameService.checkUserIsCreator(
        currentUserId,
        +gameId
      );
      //inactive game don't show data:
      if (gameStatus == "inactive") {
        res.json({ status: "inactive" });
      } else if (isCreator) {
        res.json({ status: "creator", data: completedData, gameStatus });
      } else if (gameStatus == "active" && playRecord.length == 0) {
        //game active and user haven't join this game:
        res.json({ status: "new", data: activeData });
      } else if (gameStatus == "active" && playRecord.length != 0) {
        //game active and user joined this game:
        res.json({
          status: "joined",
          data: activeData,
          attempts: playRecord[0].attempts,
        });
      } else {
        //game is completed

        res.json({ status: "completed", data: completedData });
      }
    } catch (err) {
      console.log(err);
      res.json({ err: err });
    }
  };

  joinGame = async (req: Request, res: Response) => {
    try {
      const gameId = req.params.id;
      let currentUserId = req.session["user"].id;

      await this.gameService.joinGame({
        user_id: currentUserId,
        game_id: gameId,
        attempts: 3,
        is_win: false,
      });

      res.json({ msg: "參與成功", success: true });
    } catch (err) {
      console.log(err);
      res.json({ err: err });
    }
  };

  playGame = async (req: Request, res: Response) => {
    try {
      let { targeted_location_x, targeted_location_y, isUsePlayerLocation } =
        req.body;
      if (
        !targeted_location_x ||
        !targeted_location_y ||
        isUsePlayerLocation == undefined
      ) {
        console.log(req.body);
        res.json({ err: "所交資料缺欠" });
        return;
      }
      let currentUserId = req.session["user"].id;
      const game_id = req.params.id;

      //check game's status,not active game can't play:
      let gameData = await this.gameService.checkGameData(+game_id);
      if (gameData.status !== "active") {
        res.json({ msg: "呢個遊戲已經下架" });
        return;
      }
      if (currentUserId == gameData.user_id) {
        res.json({ msg: "創建者唔可以玩自己起ge game" });
        return;
      }

      //check user play this game before or not:
      let game_history = await this.gameService.getPlayGameRecord(
        currentUserId,
        +game_id
      );
      //handle user haven't join the game:
      if (game_history.length == 0) {
        res.json({ msg: "登入先la" });
        return;
      }

      //user play before but no attempts or win already:
      if (game_history[0].attempts <= 0 || game_history[0].is_win) {
        res.json({ msg: "用晒3次機會la" });
        return;
      }
      //check where have 100 score to play the game
      let scoreRecord = await this.gameService.checkUserScore(currentUserId);
      let totalScore = scoreRecord.length > 0 ? scoreRecord[0].total_score : 0;
      if (totalScore < 30) {
        res.json({
          msg: "至少要有30積分先可以提交答案，賺左積分先la!",
        });
        return;
      }

      //compare user targeted_location and answer:
      let distanceAfterCompare = checkDistance(
        { x: targeted_location_x, y: targeted_location_y },
        {
          x: gameData.x,
          y: gameData.y,
        }
      );

      if (distanceAfterCompare > 200) {
        let score_description_id = await this.gameService.getScoreDescriptionId(
          "作答失敗"
        );
        //if attempts only 1 and still wrong,deduce 100 to store:
        // console.log(
        //   "attempts:",
        //   game_history[0].attempts,
        //   "is_win:",
        //   game_history[0].is_win
        // );
        if (game_history[0].attempts == 1 && game_history[0].is_win == false) {
          await this.gameService.userAnswerWrongly(
            {
              attempts: +game_history[0].attempts - 1,
            },
            game_history[0].id,
            {
              user_id: currentUserId,
              score_change: -30,
              score_description_id,
            },
            {
              user_id: currentUserId,
              game_id,
              amount_change: 30,
            }
          );
          this.io.to(`Room-${game_id}`).emit("update room store");
          this.io.emit("update game store");
          this.io.emit("update user score");
          res.json({ msg: "都係估錯，三次機會用晒，已扣30分作為累積獎金！" });
          return;
        }
        // console.log(
        //   "attempts:",
        //   game_history[0].attempts,
        //   "id:",
        //   game_history[0].id
        // );
        await this.gameService.userAnswerWrongly(
          {
            attempts: +game_history[0].attempts - 1,
          },
          game_history[0].id
        );
        res.json({
          msg: `估錯左! 同正確坐標相差 ${distanceAfterCompare} m `,
          reduceAttempts: true,
        });
        return;
      } else {
        //get the store amount and add score_record to creator and winner
        let total_store = await this.gameService.checkGameTotalStore(+game_id);

        if (isUsePlayerLocation) {
          total_store = total_store * 2;
        }

        let winner_description_id =
          await this.gameService.getScoreDescriptionId("作答成功瓜分");
        let creator_description_id =
          await this.gameService.getScoreDescriptionId("創建者瓜分");

        await this.gameService.userAnswerCorrect(
          {
            is_win: true,
          },
          game_history[0].id,
          { status: "completed" },
          +game_id,
          {
            user_id: currentUserId,
            score_change: 100 + total_store / 2,
            score_description_id: winner_description_id,
          },
          {
            user_id: gameData.user_id,
            score_change: total_store / 2,
            score_description_id: creator_description_id,
          },
          {
            user_id: currentUserId,
            game_id,
            amount_change: -total_store,
          }
        );
      }
      this.io.to(`Room-${game_id}`).emit("update room status");
      this.io.emit("update game status");
      this.io.emit("update user score");
      res.json({ msg: `恭喜晒！你答啱左la！獎賞已發放`, success: true });
    } catch (err) {
      console.log("error:", err);
      res.json({ err: "系統出現問題" });
    }
  };

  getUserDifferentGameRecordByStatus = async (req: Request, res: Response) => {
    const userID = req.session.user.id;
    const { status } = req.params;
    let sorting = req.query.sorting;
    if (!sorting) {
      sorting = `game.created_at desc`;
    }
    let statusQuery;
    if (status == "in_progress") {
      statusQuery = "is_win=false and attempts!=0";
    } else if (status == "loss") {
      statusQuery = "is_win=false and attempts=0";
    } else {
      statusQuery = "is_win=true";
    }

    let record = await this.gameService.getUserDifferentGameRecordByStatus(
      statusQuery,
      userID,
      sorting.toString()
    );

    if (req.query.limit != undefined) {
      record = record.slice(0, 3);
    }
    res.json(record);
  };

  likeOrDislikeGameByPlayer = async (req: Request, res: Response) => {
    try {
      const { preferences, gameId } = req.query;
      if (!preferences || !gameId) {
        res.json("missing query");
        return;
      }
      let currentUserId = req.session["user"].id;
      let score_change;
      let score_description;
      let likeScoreDescriptionId = await this.gameService.getScoreDescriptionId(
        "讚好"
      );
      let dislikeScoreDescriptionId =
        await this.gameService.getScoreDescriptionId("負評");

      //different preferences setting:
      if (preferences == "like") {
        score_change = 10;
        score_description = likeScoreDescriptionId;
      } else if (preferences == "dislike") {
        score_change = -10;
        score_description = dislikeScoreDescriptionId;
      } else {
        res.json("invalid preferences type");
        return;
      }
      //handle creator like/dislike:
      let creator_id = (await this.gameService.checkGameData(+gameId)).user_id;

      if (currentUserId == creator_id) {
        res.json("creator can't like/dislike the game");
        return;
      }
      //check dislike/like before or not：
      let previousPreferenceRecord =
        await this.gameService.checkUserPreferenceRecord(
          +gameId,
          currentUserId
        );

      //have preference record before and choose different preferences now:
      if (
        previousPreferenceRecord.length > 0 &&
        previousPreferenceRecord[0].type !== preferences
      ) {
        res.json("cancel your previous preferences first");
        return;
      }
      //handle unlike/unDislike:
      if (
        previousPreferenceRecord.length > 0 &&
        previousPreferenceRecord[0].type == preferences
      ) {
        // creator score change delete record:
        let deleteRecordId =
          await this.gameService.getUserLastScoreRecordIdByDescription(
            creator_id,
            score_description
          );

        await this.gameService.cancelPreviousPreference(
          previousPreferenceRecord[0].id,
          deleteRecordId
        );
        this.io.emit("update reaction", "update");
        this.io.emit("update user score");
        res.json("cancel previous action success");
        return;
      }
      //no preference record before:
      if (previousPreferenceRecord.length == 0) {
        await this.gameService.addPreference(
          {
            game_id: gameId,
            user_id: currentUserId,
            type: preferences,
          },
          {
            user_id: creator_id,
            score_change,
            score_description_id: score_description,
          }
        );
        this.io.emit("update reaction");
        this.io.emit("update user score");
        res.json({ success: true });
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false });
    }
  };

  //user liked/dislike record:
  likeOrDislikeGameRecordByPlayer = async (req: Request, res: Response) => {
    try {
      let userId = req.session["user"].id; //login ed user
      let { preferences } = req.query;

      if (!preferences) {
        res.json("missing preferences");
        return;
      }
      let results = await this.gameService.getUserAllPreferenceGameByPreference(
        userId,
        preferences.toString()
      );

      res.json(results);
    } catch (err) {
      console.log(err);
      res.json({ success: false });
    }
  };

  getAllGamesCreateByUser = async (req: Request, res: Response) => {
    try {
      let user_id = req.session["user"].id;
      const result = await this.gameService.getAllGamesCreateByUser(user_id);
      res.json(result);
    } catch (err) {
      console.log("error:" + JSON.stringify(err));
      res.json({ success: false });
    }
  };

  getRank = async (req: Request, res: Response) => {
    try {
      let { period } = req.query;
      if (!period) {
        res.json("missing query");
        return;
      }
      let redeemedDescriptionId = await this.gameService.getScoreDescriptionId(
        "兌換"
      );
      let result = await this.gameService.getRankByPeriod(
        period.toString(),
        redeemedDescriptionId
      );

      res.json(result);
    } catch (e) {
      console.error(e);
      res.json({ success: false, msg: e });
    }
  };

  getCompletedGame = async (req: Request, res: Response) => {
    try {
      // let result = [];
      // if (req.session["user"]) {
      //   let userId = req.session["user"].id;
      // }

      // result = await this.gameService.getRankByPeriod(
      //   period.toString(),
      //   redeemedDescriptionId
      // );

      res.json({});
    } catch (e) {
      console.error(e);
      res.json({ success: false, msg: e });
    }
  };

  getUserScoreRecord = async (req: Request, res: Response) => {
    try {
      let userId = req.session["user"].id;

      let result = await this.gameService.getUserScoreRecord(userId);

      res.json(result);
    } catch (e) {
      console.error(e);
      res.json({ success: false, msg: e });
    }
  };

  getCompletedGamesForCheckIn = async (req: Request, res: Response) => {
    try {
      let result: any = [];
      let sorting = req.query.sorting;

      if (!sorting) {
        sorting = `game.created_at desc`;
      } else {
        sorting = sorting.toString().replace(/%20/g, " ");
      }
      if (req.session["user"]) {
        let userId = req.session["user"].id;

        result = await this.gameService.getAllCompletedGameUserNotCheckIn(
          userId,
          sorting
        );
      } else {
        result = await this.gameService.getAllCompletedGame(sorting);
      }
      if (req.query.limit) {
        result = result.slice(0, req.query.limit);
      }

      res.json(result);
    } catch (e) {
      console.error(e);
      res.json({ success: false, msg: e });
    }
  };
}

export default GameController;
