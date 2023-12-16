import express, { Request, Response } from "express";
import { knex } from "../utils/db";
import { isLoggedIn } from "../utils/guard";
import { logger } from "../utils/logger";
import { multerUpload } from "../utils/multer";

const gameRoutes = express.Router();

// Game Routes
gameRoutes.get("/games", getAllActiveGames);
gameRoutes.post("/game", isLoggedIn, multerUpload, uploadGame);
gameRoutes.get("/game/:id", isLoggedIn, getSingleGame);
gameRoutes.post("/game/record/:id", isLoggedIn, playGame); //to do:all play game count need to move from frontend to backend:
//creator record
gameRoutes.get("/creator/games", getAllGamesCreateByUser);

// player status
gameRoutes.get("/game/status", getUserDifferentGameStatus);
gameRoutes.post(
  "/game/like-dislike/:id",
  isLoggedIn,
  likeOrDislikeGameByPlayer
);
gameRoutes.get(
  "/game/like_dislike",
  isLoggedIn,
  likeOrDislikeGameRecordByPlayer
);

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
    let { id } = req.session["user"];

    await txn("game").insert({
      user_id: id,
      media,
      target_location: targeted_location,
      answer_name,
      answer_address,
      answer_description,
      hints_1,
      hints_2,
    });

    let score_description_id = await getScoreDescriptionId("創建房間");
    await txn("score_record").insert({
      user_id: id,
      score_change: 100,
      score_description_id,
    });

    await txn.commit();

    res.json({ success: true });
  } catch (err) {
    await txn.rollback();
    logger.error("error:", err);
    res.json({ success: false, error: err });
  }
}

async function getScoreDescriptionId(keyword: string) {
  return (
    await knex
      .select("id")
      .from("score_description")
      .where("description", "ilike", `%${keyword}%`)
      .first()
  ).id;
}

async function getSingleGame(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const result = (
      await knex.raw(
        `select * from game left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
    on game.id=store.game_id where game.id=?`,
        [id]
      )
    ).rows;

    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ msg: err });
  }
}
//to do
async function playGame(req: Request, res: Response) {
  try {
    let { targeted_location, attempts, completion, score_completion } =
      req.body;
    let { id } = req.session["user"];
    const game_id = req.params.id;

    await knex.raw(
      `insert into game_history(game_id, user_id, guess_location, attempts, completion, score_completion, created_at,updated_at) values
                 ('${game_id}','${id}','(${targeted_location})', ${attempts}, ${completion}, ${score_completion}, NOW(),NOW())
             `
    );

    await knex.raw(
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

async function getUserDifferentGameStatus(req: Request, res: Response) {
  const userID = req.params.id;
  const { status } = req.query;

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

// to do:like game insert data to table:
async function likeOrDislikeGameByPlayer(req: Request, res: Response) {
  try {
    const { id } = req.params; //game id
    let userId = req.session["user"].id; //login ed user
    let creatorData = await knex.raw(/*sql*/ `           
      select game.user_id from game where game.id=${id}
            
            `);

    //insert like record to db
    let creator_id = creatorData.rows[0].user_id; //find out game.user_id
    let likeRecordBySamePlayer = await knex.raw(
      /*sql*/ "select * from likes where game_id= $1 and user_id= $2",
      [id, userId]
    );
    // let likeRecordByCreator=await knex.raw(/*sql*/ `select * from likes inner join game on likes.game_id =game.id where game.user_id =${creator_id} and likes.user_id=${userId}`);

    if (likeRecordBySamePlayer.rowCount == 0 && userId != creator_id) {
      //not allow like same game more than once and creator like his game
      await knex.raw(/*sql*/ `
      INSERT INTO public.likes
      (game_id, user_id, created_at, updated_at, like_change)
      VALUES(${id}, ${userId}, 'now()', 'now()', 1)
      
      `);

      //insert like score to creator
      await knex.raw(
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

//user liked record:
async function likeOrDislikeGameRecordByPlayer(req: Request, res: Response) {
  try {
    let userId = req.session["user"].id; //login ed user
    let { preferences } = req.query;
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
preferences from like_dislike where user_id=3) as action on game.id=action.game_id
right join (select user_id,game_id as in_progress_id from game_history where user_id=3 and is_win=false and attempts!=0) as in_progress on game.id=in_progress.in_progress_id
where game.user_id!=? and preferences=?`,
      [userId, preferences]
    );

    res.json(results.rows);
  } catch (err) {
    logger.error("error:" + JSON.stringify(err));
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
    logger.error("error:" + JSON.stringify(err));
    res.json({ success: false });
  }
}

export default gameRoutes;
