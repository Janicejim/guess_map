import express, { Request, Response } from "express";
import { knex } from "../utils/db";
import { isLoggedIn } from "../utils/guard";
import { multerUpload } from "../utils/multer";

const gameRoutes = express.Router();

// Game Routes
gameRoutes.get("/games", isLoggedIn, getAllActiveGames);
gameRoutes.post("/game", isLoggedIn, multerUpload, uploadGame);
gameRoutes.get("/game", isLoggedIn, getSingleGame);
gameRoutes.post("/game/join/:id", isLoggedIn, joinGame);
gameRoutes.post("/game/play/:id", isLoggedIn, playGame);
//creator record
gameRoutes.get("/creator/games", getAllGamesCreateByUser);

// player status
gameRoutes.get("/game/record/:status", getUserDifferentGameRecordByStatus);
gameRoutes.post("/game/like-dislike", isLoggedIn, likeOrDislikeGameByPlayer);
gameRoutes.get(
  "/game/like_dislike",
  isLoggedIn,
  likeOrDislikeGameRecordByPlayer
);
gameRoutes.get("/rank", isLoggedIn, getRank);

//////get game data///////
async function getAllActiveGames(req: Request, res: Response) {
  let user_id = req.session.user.id;
  const results = await knex.raw(
    `select game.id,users.name,media,game.created_at,profile_image,like_number,dislike_number,store_amount,
    preferences from game
    join users on game.user_id=users.id 
    left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
    on game.id=like_record.game_id 
    left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
    on game.id=dislike_record.game_id 
    left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
    on game.id=store.game_id
    left join (select game_id,type as 
    preferences from like_dislike where user_id=?) as action on game.id=action.game_id
    where game.user_id!=? and game.status='active'`,
    [user_id, user_id]
  );

  res.json(results.rows);
}

async function uploadGame(req: Request, res: Response) {
  let txn = await knex.transaction();
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

    await txn("game").insert({
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

    let score_description_id = await getScoreDescriptionId("創建遊戲");
    await txn("score_record").insert({
      user_id: id,
      score_change: 100,
      score_description_id,
    });

    await txn.commit();

    res.json({ success: true });
  } catch (err) {
    await txn.rollback();
    console.log("error:", err);
    res.json({ success: false, error: err });
  }
}

async function getScoreDescriptionId(keyword: string) {
  let result = (
    await knex
      .select("id")
      .from("score_description")
      .where("description", "ilike", `%${keyword}%`)
  )[0].id;

  if (result) {
    return result;
  } else {
    return;
  }
}

async function getSingleGame(req: Request, res: Response) {
  try {
    const gameId = req.query.id;
    const currentUserId = req.session["user"].id;
    // //check user play this game history:
    const playRecord = (
      await knex.raw(
        `select attempts,is_win from game_history where game_history.user_id=? and game_id=?`,
        [currentUserId, gameId]
      )
    ).rows;
    //check the game status: active,inactive or completed:
    const gameStatus = (
      await knex.select("status").from("game").where("id", gameId)
    )[0].status;

    //get active game data:
    const activeData = (
      await knex.raw(
        `select id,user_id,media,hints_1,hints_2,status,created_at,updated_at,store_amount from game left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
on game.id=store.game_id where game.id=?`,
        [gameId]
      )
    ).rows;

    //inactive game don't show data:
    if (gameStatus == "inactive") {
      res.json({ status: "inactive" });
    } else if (gameStatus == "active" && playRecord.length == 0) {
      //game active and user haven't join this game:

      res.json({ status: "new", data: activeData });
    } else if (gameStatus == "active" && playRecord.length != 0) {
      //game active and user joined this game:
      const data = (
        await knex.raw(
          `select id,user_id,media,hints_1,hints_2,status,created_at,updated_at,store_amount from game left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
      on game.id=store.game_id where game.id=?`,
          [gameId]
        )
      ).rows;

      res.json({ status: "joined", data, attempts: playRecord[0].attempts });
    } else {
      //game is completed
      const data = (
        await knex.raw(
          `select * from game join (select name as winner,game_history.game_id from game_history join users on game_history.user_id=users.id where is_win=true ) as winner_info on game.id=winner_info.game_id where game.id=?`,
          [gameId]
        )
      ).rows;

      res.json({ status: "completed", data });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: err });
  }
}

async function joinGame(req: Request, res: Response) {
  let txn = await knex.transaction();
  try {
    const gameId = req.params.id;
    let currentUserId = req.session["user"].id;

    //check where have 100 score to play the game
    let scoreRecord = (
      await knex.raw(
        `select sum(score_change)as total_score from score_record where user_id=? group by user_id `,
        [currentUserId]
      )
    ).rows;

    // console.log({ scoreRecord });
    let totalScore = scoreRecord.length > 0 ? scoreRecord[0].total_score : 0;
    console.log({ totalScore });
    if (totalScore < 100) {
      res.json("no enough score to play, create game to earn the score");
      return;
    }

    //insert game_history record:
    await txn("game_history").insert({
      user_id: currentUserId,
      game_id: gameId,
      attempts: 3,
      is_win: false,
    });
    //deduce player score:
    await txn("score_record").insert({
      user_id: currentUserId,
      score_change: -100,
      score_description_id: await getScoreDescriptionId("參與遊戲扣減"),
    });

    //add to store:
    await txn("store_record").insert({
      user_id: currentUserId,
      game_id: gameId,
      amount_change: 100,
    });

    await txn.commit();
    res.json("joined game");
  } catch (err) {
    await txn.rollback();
    console.log(err);
    res.json({ msg: err });
  }
}

async function playGame(req: Request, res: Response) {
  let txn = await knex.transaction();
  try {
    let { targeted_location_x, targeted_location_y, isUsePlayerLocation } =
      req.body;
    let currentUserId = req.session["user"].id;
    const game_id = req.params.id;

    //check game's status,not active game can't play:
    let gameData = (
      await knex
        .select(
          "status",
          "id",
          "user_id",
          "target_location[0] as x",
          "target_location[1] as y "
        )
        .from("game")
        .where("id", game_id)
    )[0];
    if (gameData.status !== "active") {
      res.json("game is invalid to play");
      return;
    }
    if (currentUserId == gameData.user_id) {
      res.json("creator can't play the game");
      return;
    }

    //check user play this game before or not:
    let game_history = await knex
      .select("id", "attempts", "is_win")
      .from("game_history")
      .where("user_id", currentUserId)
      .andWhere("game_id", game_id);
    //handle user haven't join the game:
    if (game_history.length == 0) {
      res.json("join game fist");
      return;
    }

    //user play before but no attempts or win already:
    if (game_history[0].attempts <= 0 || game_history[0].is_win) {
      res.json("no attempt to play");
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

    if (distanceAfterCompare > 500) {
      //deduct user attempts:
      await txn("game_history")
        .update({
          attempts: +game_history[0].attempts - 1,
        })
        .where("id", game_history[0].id);
      await txn.commit();
      res.json(`guest wrongly! more than ${distanceAfterCompare} m `);
      return;
    } else {
      //1) game_history is win=true:
      await txn("game_history")
        .update({
          is_win: true,
        })
        .where("id", game_history[0].id);
      // 2)game.status=completed
      await txn("game").update({ status: "completed" }).where("id", game_id);
      //3)get the store amount and add score_record to creator and winner
      let total_store = (
        await txn.raw(
          `select sum(amount_change) as store from store_record where game_id=? group by game_id`,
          [game_id]
        )
      ).rows[0].store;

      if (isUsePlayerLocation) {
        total_store = total_store * 2;
      }

      let winner_description_id = await getScoreDescriptionId("作答成功瓜分");
      let creator_description_id = await getScoreDescriptionId("創建者瓜分");

      await txn("score_record").insert({
        user_id: currentUserId,
        score_change: total_store / 2,
        score_description_id: winner_description_id,
      });
      await txn("score_record").insert({
        user_id: gameData.user_id,
        score_change: total_store / 2,
        score_description_id: creator_description_id,
      });
      //4)deduce total store amount:
      await txn("store_record").insert({
        user_id: currentUserId,
        game_id,
        amount_change: -total_store,
      });
    }
    await txn.commit();
    res.json("you win!");
  } catch (err) {
    await txn.rollback();
    console.log("error:", err);
    res.json({ success: false, error: err });
  }
}

function checkDistance(
  userPosition: { x: number; y: number },
  answerPosition: { x: number; y: number }
) {
  let earthRadius = 6371; // Radius of the earth in km
  let latDistance = degreesToRadians(answerPosition.x - userPosition.x); // deg2rad below
  let lngDistance = degreesToRadians(answerPosition.y - userPosition.y);
  let a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(degreesToRadians(userPosition.x)) *
      Math.cos(degreesToRadians(answerPosition.x)) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance = earthRadius * c; // Distance in km
  return Math.floor(distance * 1000); //distance in m
}
function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

async function getUserDifferentGameRecordByStatus(req: Request, res: Response) {
  const userID = req.session.user.id;
  const { status } = req.params;

  let statusQuery;
  if (status == "in_progress") {
    statusQuery = "is_win=false and attempts!=0";
  } else if (status == "loss") {
    statusQuery = "is_win=false and attempts=0";
  } else {
    statusQuery = "is_win=true";
  }

  const inProgressRecord = await knex.raw(
    `select game.id,users.name,media,game.created_at,profile_image,like_number,dislike_number,store_amount,preferences from game
    join users on game.user_id=users.id 
    left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
    on game.id=like_record.game_id 
    left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
    on game.id=dislike_record.game_id 
    left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
    on game.id=store.game_id
    left join (select game_id,type as 
    preferences from like_dislike where user_id=?) as action on game.id=action.game_id
    right join (select user_id,game_id as in_progress_id from game_history where user_id=? and ${statusQuery}) as in_progress on game.id=in_progress.in_progress_id    
    `,
    [userID, userID]
  );
  return res.json(inProgressRecord.rows);
}

async function likeOrDislikeGameByPlayer(req: Request, res: Response) {
  let txn = await knex.transaction();
  try {
    const { preferences, gameId } = req.query;
    let currentUserId = req.session["user"].id;
    let score_change;
    let score_description;
    let likeScoreDescriptionId = await getScoreDescriptionId("讚好");
    let dislikeScoreDescriptionId = await await getScoreDescriptionId("負評");

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
    let creator_id = (
      await knex.raw(/*sql*/ `           
      select game.user_id from game where game.id=${gameId}
            
            `)
    ).rows[0].user_id;

    if (currentUserId == creator_id) {
      res.json("creator can't like/dislike the game");
      return;
    }
    //check dislike/like before or not：
    let previousPreferenceRecord = await knex("like_dislike")
      .select("id", "type")
      .where("game_id", gameId)
      .andWhere("user_id", currentUserId);

    //have preference record before and choose different preferences now:
    if (
      previousPreferenceRecord.length > 0 &&
      previousPreferenceRecord[0].type !== preferences
    ) {
      console.log("change action but haven't cancel before action");
      res.json("cancel your previous preferences first");
      return;
    }
    //handle unlike/unDislike:
    if (
      previousPreferenceRecord.length > 0 &&
      previousPreferenceRecord[0].type == preferences
    ) {
      await txn("like_dislike")
        .where("id", previousPreferenceRecord[0].id)
        .del();
      // creator score change delete record:
      let deleteRecordId = (
        await txn("score_record")
          .select("id")
          .where("user_id", creator_id)
          .andWhere("score_description_id", score_description)
          .orderBy("created_at", "desc")
      )[0].id;

      await txn("score_record").where("id", deleteRecordId).del();

      await txn.commit();
      res.json("cancel previous action success");
      return;
    }
    //no preference record before:
    if (previousPreferenceRecord.length == 0) {
      await txn("like_dislike").insert({
        game_id: gameId,
        user_id: currentUserId,
        type: preferences,
      });

      await txn("score_record").insert({
        user_id: creator_id,
        score_change,
        score_description_id: score_description,
      });
    }

    await txn.commit();
    res.json({ success: true });
  } catch (err) {
    await txn.rollback();
    console.log(err);
    res.json({ success: false });
  }
}

//user liked/dislike record:
async function likeOrDislikeGameRecordByPlayer(req: Request, res: Response) {
  try {
    let userId = req.session["user"].id; //login ed user
    let { preferences } = req.query;

    if (!preferences) {
      res.json("missing preferences");
      return;
    }
    let results = await knex.raw(
      /*sql*/ `select game.id,users.name,media,game.created_at,profile_image,like_number,dislike_number,store_amount,preferences from game
join users on game.user_id=users.id 
left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
on game.id=like_record.game_id 
left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
on game.id=dislike_record.game_id 
left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
on game.id=store.game_id
left join (select game_id,type as 
preferences from like_dislike where user_id=?) as action on game.id=action.game_id
where preferences=?`,
      [userId, preferences]
    );

    res.json(results.rows);
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}

async function getAllGamesCreateByUser(req: Request, res: Response) {
  try {
    let user_id = req.session["user"].id;
    const result = await knex.raw(
      `select game.id,users.name,media,game.created_at,profile_image,like_number,dislike_number from game left join users on game.user_id=users.id left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record on game.id=like_record.game_id left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record on game.id=dislike_record.game_id left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
      on game.id=store.game_id where game.user_id=?`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.log("error:" + JSON.stringify(err));
    res.json({ success: false });
  }
}

async function getRank(req: Request, res: Response) {
  try {
    let { period } = req.query;
    let result;
    if (period === "monthly") {
      result = (
        await knex.raw(`select name,sum(score_change)as score from score_record join users on users.id =score_record.user_id where score_record.created_at > now() - interval '1 month' group by user_id,name order by score desc limit 10

      `)
      ).rows;
    } else if (period === "weekly") {
      result = (
        await knex.raw(`select name,sum(score_change)as score from score_record join users on users.id =score_record.user_id where score_record.created_at > now() - interval '1 week' group by user_id,name order by score desc limit 10

      `)
      ).rows;
    } else if (period === "daily") {
      result = (
        await knex.raw(`select name,sum(score_change)as score from score_record join users on users.id =score_record.user_id where score_record.created_at > now() - interval '1 day' group by user_id,name order by score desc limit 10

      `)
      ).rows;
    } else {
      result = (
        await knex.raw(
          `select name,sum(score_change)as score from score_record join users on users.id =score_record.user_id group by user_id,name order by score desc limit 10;`
        )
      ).rows;
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.json({ success: false, msg: e });
  }
}

export default gameRoutes;
