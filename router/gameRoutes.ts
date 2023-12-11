import express, { Request, Response } from "express";
import { client } from "../utils/db";
import { isLoggedIn } from "../utils/guard";
import { logger } from "../utils/logger";
import { io } from "./SocketRoute";
import { multerUpload } from "../utils/multer";

const gameRoutes = express.Router();

// Game Routes
gameRoutes.get("/games", getAllGames);
gameRoutes.post("/game", isLoggedIn, multerUpload, uploadGame);
gameRoutes.get("/game/:id", isLoggedIn, showSingleGame);
gameRoutes.post("/game/record/:id", isLoggedIn, playSingleGame);
// get user game status
gameRoutes.get("/user/status/:id", getUserGameStatus);
gameRoutes.get("/game/completed", getCompletedGame);
gameRoutes.post("/game/like/:id", isLoggedIn, likeGameById);
gameRoutes.post("/game/dislike/:id", isLoggedIn, dislikeGameById);
gameRoutes.get("/game/like", isLoggedIn, likeGameByUser);
gameRoutes.get("/game/dislike", isLoggedIn, disLikeGameByUser);

//////get game data///////
async function getAllGames(req: Request, res: Response) {
  const results = await client.query(
    `select game.id as id, total_likes, total_dislikes, game.user_id,game.media,users.name,users.profile_image 
    from game inner join users on users.id=game.user_id
    inner join (select COALESCE( sum(likes.like_change ), 0 ) as total_likes,game.id as game_id 
       from likes 
        right join game on likes.game_id =game.id group by game.id) 
    as like_record on like_record.game_id = game.id 
    inner  join (select COALESCE( sum(dislikes.dislike_change ), 0 ) as total_dislikes,game.id as game_id 
        from dislikes 
        right join game on dislikes.game_id =game.id group by game.id)
    as dislike_record on dislike_record.game_id = game.id order by game.created_at desc`
  );
  console.table("Load all games");

  res.json(results.rows);
}

async function uploadGame(req: Request, res: Response) {
  try {
    const media = req.file?.filename;
    let { targeted_location, hints_1, hints_2 } = req.body;
    // targeted_location = await  JSON.parse(targeted_location);
    let { id } = req.session["user"];

    await client.query(
      `insert into game(user_id, media,targeted_location,hints_1,hints_2,created_at,updated_at) values 
                ('${id}','${media}','(${targeted_location})','${hints_1}','${hints_2}',NOW(),NOW())
            `
    );
    io.emit("updateGame");

    await client.query(
      `INSERT INTO score
      (user_id, score_change, score_description, created_at, updated_at)
      VALUES(${id}, 100, 'Upload game', 'now()', 'now()')
    `
    );

    res.json({ success: true });
  } catch (err) {
    logger.error("error:", err);
    res.json({ success: false, error: err });
  }
}

async function showSingleGame(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const result = await client.query(`select * from game where id=${id}`);
    // console.log("Load Single Game : " + result);

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.json({ msg: err });
  }
}

async function playSingleGame(req: Request, res: Response) {
  try {
    let { targeted_location, attempts, completion, score_completion } =
      req.body;
    // console.log(targeted_location);
    let { id } = req.session["user"];
    const game_id = req.params.id;
    // console.log(`${req.params.id}`);

    // console.log(`${game_id},${id},${targeted_location}`);

    // targeted_location = await JSON.parse(targeted_location);
    await client.query(
      `insert into game_history(game_id, user_id, guess_location, attempts, completion, score_completion, created_at,updated_at) values
                 ('${game_id}','${id}','(${targeted_location})', ${attempts}, ${completion}, ${score_completion}, NOW(),NOW())
             `
    );

    await client.query(
      `INSERT INTO score
       (user_id, score_change, score_description, created_at, updated_at)
       VALUES(${id}, ${score_completion}, 'Play game', 'now()', 'now()')
     `
    );
    res.json({ success: true });
  } catch (err) {
    logger.error("error:", err);
    res.json({ success: false, error: err });
  }
}

async function getUserGameStatus(req: Request, res: Response) {
  const userID = req.params.id;
  // console.log("userID", userID);
  const userGameStatus = await client.query(
    `select users.id,users.name,game_history.game_id,game_history.attempts,game_history.completion,game_history.score_completion from users inner join game_history on users.id=game_history.user_id where users.id='${userID}' order by score_completion asc`
  );
  // console.log(userGameStatus.rows);
  return res.json(userGameStatus.rows);
}

// like game insert data to table:
async function likeGameById(req: Request, res: Response) {
  try {
    const { id } = req.params; //game id
    let userId = req.session["user"].id; //login ed user
    let creatorData = await client.query(/*sql*/ `           
      select game.user_id from game where game.id=${id}
            
            `);

    //insert like record to db
    let creator_id = creatorData.rows[0].user_id; //find out game.user_id
    let likeRecordBySamePlayer = await client.query(
      /*sql*/ "select * from likes where game_id= $1 and user_id= $2",
      [id, userId]
    );
    // let likeRecordByCreator=await client.query(/*sql*/ `select * from likes inner join game on likes.game_id =game.id where game.user_id =${creator_id} and likes.user_id=${userId}`);

    if (likeRecordBySamePlayer.rowCount == 0 && userId != creator_id) {
      //not allow like same game more than once and creator like his game
      await client.query(/*sql*/ `
      INSERT INTO public.likes
      (game_id, user_id, created_at, updated_at, like_change)
      VALUES(${id}, ${userId}, 'now()', 'now()', 1)
      
      `);
      io.emit("updateGame");
      //insert like score to creator
      await client.query(
        `INSERT INTO score
      (user_id, score_change, score_description, created_at, updated_at)
      VALUES(${creator_id}, 10, 'like by other', 'now()', 'now()')
    `
      );
    }

    res.json({ success: true });
  } catch (err) {
    logger.error("error:" + JSON.stringify(err));
    res.json({ success: false });
  }
}

//dislike game insert data to table:
async function dislikeGameById(req: Request, res: Response) {
  try {
    const { id } = req.params; //game id
    let userId = req.session["user"].id; //login ed user
    let creatorData = await client.query(/*sql*/ `           
    select game.user_id from game where game.id=${id}
          
          `);
    //   //insert dislike record to db
    let creator_id = creatorData.rows[0].user_id; //find out game.user_id
    // console.log(creator_id);
    let disLikeRecordBySamePlayer = await client.query(
      /*sql*/ `select * from dislikes where game_id=${id} and user_id=${userId}`
    );
    let disLikeRecordByCreator = await client.query(
      /*sql*/ `select * from dislikes inner join game on dislikes.game_id =game.id where game.user_id =${creator_id} and dislikes.user_id=${userId}`
    );

    if (
      disLikeRecordBySamePlayer.rowCount == 0 &&
      disLikeRecordByCreator.rowCount == 0
    ) {
      await client.query(/*sql*/ `
      INSERT INTO public.dislikes
      (game_id, user_id, created_at, updated_at, dislike_change)
      VALUES(${id}, ${userId}, 'now()', 'now()', 1)
      `);
      io.emit("updateGame");
      //insert dislike score to creator
      await client.query(
        `INSERT INTO score
        (user_id, score_change, score_description, created_at, updated_at)
        VALUES(${creator_id}, -10, 'dislike by other', 'now()', 'now()')
      `
      );
    }
    res.json({ success: true });
  } catch (err) {
    logger.error("error:" + JSON.stringify(err));
    res.json({ success: false });
  }
}

//user liked record:
async function likeGameByUser(req: Request, res: Response) {
  try {
    // const { id } = req.params; //game id
    let userId = req.session["user"].id; //login ed user

    let results = await client.query(
      /*sql*/ `select likes.user_id,likes.game_id from likes where likes.user_id=${userId};`
    );

    // io.emit("updateGame")
    res.json(results.rows);
  } catch (err) {
    logger.error("error:" + JSON.stringify(err));
    res.json({ success: false });
  }
}

//user disliked record:
async function disLikeGameByUser(req: Request, res: Response) {
  try {
    // const { id } = req.params; //game id
    let userId = req.session["user"].id; //login ed user

    let results = await client.query(
      /*sql*/ `select dislikes.user_id,dislikes.game_id from dislikes where dislikes.user_id=${userId};`
    );

    // io.emit("updateGame")
    res.json(results.rows);
  } catch (err) {
    logger.error("error:" + JSON.stringify(err));
    res.json({ success: false });
  }
}

//get completed game
async function getCompletedGame(req: Request, res: Response) {
  try {
    // const { id } = req.params; //game id
    let userId = req.session["user"].id; //login ed user

    let results = await client.query(
      /*sql*/ `select user_id,game_id,completion from game_history where completion=true and user_id=${userId}`
    );

    res.json(results.rows);
  } catch (err) {
    logger.error("error:" + JSON.stringify(err));
    res.json({ success: false });
  }
}

export default gameRoutes;
