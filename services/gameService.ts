import { Knex } from "knex";
import {
  Game,
  GameHistory,
  Preference,
  ScoreData,
  StoreData,
} from "../utils/model";

class GameService {
  constructor(private knex: Knex) {}

  async getAllActiveGames(sorting: string) {
    return await this.knex.raw(
      `select game.status,game.id,users.id as user_id,users.name,media,game.created_at,profile_image,COALESCE(like_number,0) as like_number,COALESCE(dislike_number,0) as dislike_number ,COALESCE(store_amount,0) as store_amount ,COALESCE(check_in_number,0) as check_in_number from game
      join users on game.user_id=users.id 
      left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
      on game.id=like_record.game_id 
      left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
      on game.id=dislike_record.game_id 
      left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
      on game.id=store.game_id left join(select game_id,count (game_id) as check_in_number from check_in where status='active' group by game_id) as check_in_record
      on game.id=check_in_record.game_id
      where game.status='active' order by ${sorting}`
    );
  }

  async getAllActiveGamesByUser(user_id: number, sorting: string) {
    let activeGames = (
      await this.knex.raw(
        `select game.status,game.id,users.id as user_id,users.name,media,game.created_at,profile_image,COALESCE(like_number,0) as like_number,COALESCE(dislike_number,0) as dislike_number ,COALESCE(store_amount,0) as store_amount,
    preferences ,COALESCE(check_in_number,0) as check_in_number from game
    join users on game.user_id=users.id 
    left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
    on game.id=like_record.game_id 
    left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
    on game.id=dislike_record.game_id 
    left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
    on game.id=store.game_id
    left join (select game_id,type as 
    preferences from like_dislike where user_id=?) as action on game.id=action.game_id left join(select game_id,count (game_id) as check_in_number from check_in where status='active' group by game_id) as check_in_record on game.id=check_in_record.game_id
    where game.user_id!=? and game.status='active' order by ${sorting}`,
        [user_id, user_id]
      )
    ).rows;

    let userJoinedGames = await this.getUserAllJoinedGame(user_id);
    let neverJoinGames = activeGames.filter((game: { id: number }) => {
      return !userJoinedGames.some(
        (joinedGame: { game_id: number }) => game.id === joinedGame.game_id
      );
    });

    return neverJoinGames;
  }

  async checkUserIsCreator(user_id: number, game_id: number) {
    let creatorId = (
      await this.knex.select("user_id").from("game").where("id", game_id)
    )[0].user_id;
    if (user_id == creatorId) {
      return true;
    } else {
      return false;
    }
  }

  async getScoreDescriptionId(keyword: string) {
    let result = (
      await this.knex
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

  async createGame(gameData: Game) {
    await this.knex("game").insert(gameData);

    return;
  }

  async getPlayGameRecord(currentUserId: number, gameId: number) {
    return (
      await this.knex.raw(
        `select id,game_id,attempts,is_win from game_history where user_id=? and game_id=?`,
        [currentUserId, gameId]
      )
    ).rows;
  }

  async getUserAllJoinedGame(currentUserId: number) {
    return (
      await this.knex.raw(`select game_id from game_history where user_id=?`, [
        currentUserId,
      ])
    ).rows;
  }
  async checkGameData(gameId: number) {
    return (
      await this.knex
        .select(
          "status",
          "id",
          "user_id",
          "target_location[0] as x",
          "target_location[1] as y "
        )
        .from("game")
        .where("id", gameId)
    )[0];
  }

  async getActiveGameInfo(gameId: number) {
    return (
      await this.knex.raw(
        `select id,user_id,media,hints_1,hints_2,status,created_at,updated_at,COALESCE(store_amount,0) as store_amount from game left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
on game.id=store.game_id where game.id=?`,
        [gameId]
      )
    ).rows;
  }

  async getCompletedGameInfo(gameId: number) {
    return (
      await this.knex.raw(
        `select * from game left join (select name as winner,game_history.game_id from game_history join users on game_history.user_id=users.id where is_win=true ) as winner_info on game.id=winner_info.game_id where game.id=?`,
        [gameId]
      )
    ).rows;
  }

  async getAllCompletedGame(sorting: string) {
    return (
      await this.knex
        .raw(`select game.id,game.status,users.name,media,game.created_at,profile_image,COALESCE(like_number,0) as like_number,COALESCE(dislike_number,0) as dislike_number ,COALESCE(check_in_number,0) as check_in_number from game
    join users on game.user_id=users.id 
    left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
    on game.id=like_record.game_id 
    left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
    on game.id=dislike_record.game_id 
    left join(select game_id,count (game_id) as check_in_number from check_in where status='active' group by game_id) as check_in_record
    on game.id=check_in_record.game_id
    where game.status='completed' order by ${sorting}`)
    ).rows;
  }

  async getAllCompletedGameUserNotCheckIn(user_id: number, sorting: string) {
    let allCompletedGame = await this.getAllCompletedGame(sorting);

    let userCheckInRecord = await this.knex("check_in")
      .select("game_id")
      .where("user_id", user_id);

    if (userCheckInRecord.length == 0) {
      return allCompletedGame;
    } else {
      let filteredRecord = allCompletedGame.filter(
        (game: { id: number }) =>
          !userCheckInRecord.some((record) => record.game_id === game.id)
      );

      return filteredRecord;
    }
  }

  async checkUserScore(currentUserId: number) {
    return (
      await this.knex.raw(
        `select sum(score_change)as total_score from score_record where user_id=? group by user_id `,
        [currentUserId]
      )
    ).rows;
  }

  async joinGame(gameHistoryData: GameHistory) {
    //insert game_history record:
    await this.knex("game_history").insert(gameHistoryData);
    return;
  }

  async userAnswerWrongly(
    gameHistoryData: { attempts: number },
    game_history_id: number,
    scoreData?: ScoreData,
    storeData?: StoreData
  ) {
    let txn = await this.knex.transaction();
    try {
      //insert game_history record:
      // console.log(gameHistoryData, game_history_id, scoreData, storeData);
      await txn("game_history")
        .update(gameHistoryData)
        .where("id", game_history_id);

      if (scoreData && storeData && scoreData.score_change != 0) {
        await txn("score_record").insert(scoreData);
        await txn("store_record").insert(storeData);
      }

      await txn.commit();
    } catch (e) {
      console.log(e);
      await txn.rollback();
    }
  }

  async userAnswerCorrect(
    gameHistoryData: { is_win: boolean },
    gameHistoryId: number,
    gameData: { status: string },
    gameId: number,
    winnerScoreRecordData: ScoreData,
    creatorScoreRecordData: ScoreData,
    storeRecordData: StoreData
  ) {
    let txn = await this.knex.transaction();
    try {
      //game_history is win=true:
      await txn("game_history")
        .update(gameHistoryData)
        .where("id", gameHistoryId);
      //game.status=completed
      await txn("game").update(gameData).where("id", gameId);
      //winner and creator win the store:
      await txn("score_record").insert(winnerScoreRecordData);
      await txn("score_record").insert(creatorScoreRecordData);
      //deduce total store amount:
      await txn("store_record").insert(storeRecordData);
      await txn.commit();
    } catch (e) {
      console.log(e);
      await txn.rollback();
    }
  }

  async checkGameTotalStore(gameId: number) {
    return (
      await this.knex.raw(
        `select sum(COALESCE(amount_change,0)) as store from store_record where game_id=? group by game_id`,
        [gameId]
      )
    ).rows;
  }

  async getUserDifferentGameRecordByStatus(
    statusQuery: string,
    userId: number,
    sorting: string,
    completedQuery?: string
  ) {
    return (
      await this.knex.raw(
        `select game.status,game.id,users.id as user_id,users.name,media,game.created_at,profile_image,COALESCE(like_number,0) as like_number,COALESCE(dislike_number,0) as dislike_number ,COALESCE(store_amount,0) as store_amount, preferences,COALESCE(check_in_number,0) as check_in_number from game
    join users on game.user_id=users.id 
    left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
    on game.id=like_record.game_id 
    left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
    on game.id=dislike_record.game_id 
    left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
    on game.id=store.game_id
    left join (select game_id,type as 
    preferences from like_dislike where user_id=?) as action on game.id=action.game_id
    left join(select game_id,count (game_id) as check_in_number from check_in where status='active' group by game_id) as check_in_record on game.id=check_in_record.game_id 
    right join (select user_id,game_id as in_progress_id from game_history where user_id=? and ${statusQuery}) as in_progress on game.id=in_progress.in_progress_id ${completedQuery} order by ${sorting}
    `,
        [userId, userId]
      )
    ).rows;
  }

  async checkUserPreferenceRecord(gameId: number, currentUserId: number) {
    return await this.knex("like_dislike")
      .select("id", "type")
      .where("game_id", gameId)
      .andWhere("user_id", currentUserId);
  }

  async cancelPreviousPreference(recordId: number, deleteRecordId: number) {
    let txn = await this.knex.transaction();
    try {
      await txn("like_dislike").where("id", recordId).del();
      await txn("score_record").where("id", deleteRecordId).del();
      await txn.commit();
    } catch (e) {
      console.log(e);
      await txn.rollback();
    }
  }

  async getUserLastScoreRecordIdByDescription(
    creator_id: number,
    score_description_id: number
  ) {
    return (
      await this.knex("score_record")
        .select("id")
        .where("user_id", creator_id)
        .andWhere("score_description_id", score_description_id)
        .orderBy("created_at", "desc")
    )[0].id;
  }

  async addPreference(preferencesData: Preference, scoreRecord: ScoreData) {
    let txn = await this.knex.transaction();
    try {
      await txn("like_dislike").insert(preferencesData);

      await txn("score_record").insert(scoreRecord);

      await txn.commit();
    } catch (e) {
      console.log(e);
      await txn.rollback();
    }
  }

  async getUserAllPreferenceGameByPreference(
    userId: number,
    preferences: string
  ) {
    return (
      await this.knex.raw(
        /*sql*/ `select game.status,game.id,users.name,media,game.created_at,profile_image,COALESCE(like_number,0) as like_number,COALESCE(dislike_number,0) as dislike_number ,COALESCE(store_amount,0) as store_amount,preferences,COALESCE(check_in_number,0) as check_in_number from game
join users on game.user_id=users.id 
left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record 
on game.id=like_record.game_id 
left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record 
on game.id=dislike_record.game_id 
left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
on game.id=store.game_id
left join (select game_id,type as 
preferences from like_dislike where user_id=?) as action on game.id=action.game_id
left join(select game_id,count (game_id) as check_in_number from check_in where status='active' group by game_id) as check_in_record on game.id=check_in_record.game_id
where preferences=?`,
        [userId, preferences]
      )
    ).rows;
  }

  async getAllGamesCreateByUser(user_id: number) {
    return (
      await this.knex.raw(
        `select game.status,game.id,users.name,media,game.created_at,profile_image,COALESCE(like_number,0) as like_number,COALESCE(dislike_number,0) as dislike_number,COALESCE(check_in_number,0) as check_in_number from game left join users on game.user_id=users.id left join (select game_id,count(type) as like_number from like_dislike where type='like' group by type,game_id ) as like_record on game.id=like_record.game_id left join (select game_id,count(type) as dislike_number from like_dislike where type='dislike' group by type,game_id ) as dislike_record on game.id=dislike_record.game_id left join(select game_id,sum(amount_change) as store_amount from store_record group by game_id) as store
    on game.id=store.game_id left join(select game_id,count (game_id) as check_in_number from check_in where status='active' group by game_id) as check_in_record on game.id=check_in_record.game_id where game.user_id=?`,
        [user_id]
      )
    ).rows;
  }

  async getUserScoreRankByPeriod(period: string, description_id: number) {
    let periodQuery = "";

    if (period == "monthly") {
      periodQuery = `where score_record.created_at > now() - interval '1 month' `;
    } else if (period == "weekly") {
      periodQuery = `where score_record.created_at > now() - interval '1 week'`;
    } else if (period == "daily") {
      periodQuery = `where score_record.created_at > now() - interval '1 day'`;
    }
    let finalQuery;
    if (!periodQuery) {
      finalQuery = `select user_id,name,sum(score_change)as score,profile_image from score_record join users on users.id =score_record.user_id where score_description_id !=${description_id} group by user_id,name,profile_image order by score desc limit 10;`;
    } else {
      finalQuery = `select user_id,name,sum(score_change)as score,profile_image from score_record join users on users.id =score_record.user_id ${periodQuery} and score_description_id !=${description_id} group by user_id,name,profile_image order by score desc limit 10;`;
    }

    return (await this.knex.raw(finalQuery)).rows;
  }

  async getUserCheckInRankByPeriod(period: string) {
    let periodQuery = "";

    if (period == "monthly") {
      periodQuery = `and check_in.created_at > now() - interval '1 month' `;
    } else if (period == "weekly") {
      periodQuery = `and check_in.created_at > now() - interval '1 week'`;
    } else if (period == "daily") {
      periodQuery = `and check_in.created_at > now() - interval '1 day'`;
    }
    let finalQuery;
    if (!periodQuery) {
      finalQuery = `select user_id,name,profile_image,count(user_id)as score from check_in right join users on check_in.user_id=users.id where user_id is not null group by user_id,name,profile_image order by score desc limit 10;
      `;
    } else {
      finalQuery = `select user_id,name,profile_image,count(user_id)as score from check_in right join users on check_in.user_id=users.id where user_id is not null ${periodQuery} group by user_id,name,profile_image order by score desc limit 10;`;
    }

    return (await this.knex.raw(finalQuery)).rows;
  }

  async getGameCheckInRankByPeriod(period: string) {
    let periodQuery = "";

    if (period == "monthly") {
      periodQuery = `and check_in.created_at > now() - interval '1 month' `;
    } else if (period == "weekly") {
      periodQuery = `and check_in.created_at > now() - interval '1 week'`;
    } else if (period == "daily") {
      periodQuery = `and check_in.created_at > now() - interval '1 day'`;
    }
    let finalQuery;
    if (!periodQuery) {
      finalQuery = `select game_id,media,count(game_id)as number from check_in right join game on check_in.game_id=game.id where game_id is not null group by game_id,media order by number desc limit 10;
      `;
    } else {
      finalQuery = `select game_id,media,count(game_id)as number from check_in right join game on check_in.game_id=game.id where game_id is not null ${periodQuery} group by game_id,media order by number desc limit 10;`;
    }

    return (await this.knex.raw(finalQuery)).rows;
  }

  async getGameLikeOrDislikeRankByPeriod(period: string, reaction: string) {
    let periodQuery = "";

    if (period == "monthly") {
      periodQuery = `and like_dislike.updated_at > now() - interval '1 month' `;
    } else if (period == "weekly") {
      periodQuery = `and like_dislike.updated_at > now() - interval '1 week'`;
    } else if (period == "daily") {
      periodQuery = `and like_dislike.updated_at > now() - interval '1 day'`;
    }

    let finalQuery;
    if (reaction == "like") {
      if (!periodQuery) {
        finalQuery = `select game_id,media,count(game_id)as number from like_dislike right join game on like_dislike.game_id=game.id where game_id is not null and type='like' group by game_id,media order by number desc limit 10;
        `;
      } else {
        finalQuery = `select game_id,media,count(game_id)as number from like_dislike right join game on like_dislike.game_id=game.id where game_id is not null and type='like' ${periodQuery} group by game_id,media order by number desc limit 10;`;
      }
    } else {
      if (!periodQuery) {
        finalQuery = `select game_id,media,count(game_id)as number from like_dislike right join game on like_dislike.game_id=game.id where game_id is not null and type='dislike' group by game_id,media order by number desc limit 10;
        `;
      } else {
        finalQuery = `select game_id,media,count(game_id)as number from like_dislike right join game on like_dislike.game_id=game.id where game_id is not null and type='dislike' ${periodQuery} group by game_id,media order by number desc limit 10;`;
      }
    }

    return (await this.knex.raw(finalQuery)).rows;
  }

  async getUserScoreRecord(user_id: number) {
    return (
      await this.knex.raw(
        `select description,score_description.image,score_record.created_at,score_record.score_change from score_record join score_description on score_record.score_description_id=score_description.id where user_id=? order by score_record.created_at desc`,
        [user_id]
      )
    ).rows;
  }
}

export default GameService;
