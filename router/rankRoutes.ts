import express, { Request, Response } from "express";
import { client } from "../utils/db";
import { isLoggedIn } from "../utils/guard";
import { logger } from "../utils/logger";

const rankRoutes = express.Router();

//score route
rankRoutes.get("/rank/daily", isLoggedIn, getDailyRank);
rankRoutes.get("/rank/weekly", isLoggedIn, getWeeklyRank);
rankRoutes.get("/rank/monthly", isLoggedIn, getMonthlyRank);
rankRoutes.get("/rank/total", isLoggedIn, getTotalRank);

//daily rank function
async function getDailyRank(req: Request, res: Response) {
  try {
    const results = await client.query(
      `select users.name,score_change from score inner join users on score.user_id =users.id where score.created_at > now() - interval '1 day'`
    );
    let data = results.rows;

    const answer = data.reduce((res, item) => {
      //combine same user and sum the score
      let key = item.name + "_";
      if (!res[key]) {
        res[key] = item;
      } else {
        res[key].score_change =
          Number(res[key].score_change) + Number(item.score_change) + "";
      }
      return res;
    }, {});

    let record = Object.values(answer);
    //@ts-ignore
    let recordDesc = record.sort(compare("score_change"));

    res.json(recordDesc);
  } catch (error) {
    logger.error("Err:", error);
    res.json({ msg: "get daily rank fail" });
  }
}

//weekly rank function
async function getWeeklyRank(req: Request, res: Response) {
  try {
    const results = await client.query(
      `select users.name,score_change from score inner join users on score.user_id =users.id where score.created_at > now() - interval '1 week' order by score.user_id `
    );
    let data = results.rows;

    const answer = data.reduce((res, item) => {
      let key = item.name + "_";
      if (!res[key]) {
        res[key] = item;
      } else {
        res[key].score_change =
          Number(res[key].score_change) + Number(item.score_change) + "";
      }
      return res;
    }, {});

    let record = Object.values(answer);
    //@ts-ignore
    let recordDesc = record.sort(compare("score_change"));

    res.json(recordDesc);
  } catch (error) {
    logger.error("Err:", error);
    res.json({ msg: "get weekly rank fail" });
  }
}

//monthly rank function
async function getMonthlyRank(req: Request, res: Response) {
  try {
    const results = await client.query(
      `select users.name,score_change from score inner join users on score.user_id =users.id where score.created_at > now() - interval '1 month' order by score.user_id `
    );
    let data = results.rows;

    const answer = data.reduce((res, item) => {
      let key = item.name + "_";
      if (!res[key]) {
        res[key] = item;
      } else {
        res[key].score_change =
          Number(res[key].score_change) + Number(item.score_change) + "";
      }
      return res;
    }, {});

    let record = Object.values(answer);
    //@ts-ignore
    let recordDesc = record.sort(compare("score_change"));

    res.json(recordDesc);
  } catch (error) {
    logger.error("Err:", error);
    res.json({ msg: "get monthly rank fail" });
  }
}

//total rank function
async function getTotalRank(req: Request, res: Response) {
  try {
    const results = await client.query(
      `select users.name,score_change from score inner join users on score.user_id =users.id order by score.user_id `
    );
    let data = results.rows;

    const answer = data.reduce((res, item) => {
      let key = item.name + "_";
      if (!res[key]) {
        res[key] = item;
      } else {
        res[key].score_change =
          Number(res[key].score_change) + Number(item.score_change) + "";
      }
      return res;
    }, {});

    let record = Object.values(answer);
    //@ts-ignore
    let recordDesc = record.sort(compare("score_change"));
    return recordDesc;

    // console.log(recordDesc)
  } catch (error) {
    logger.error("Err:", error);
    res.json({ msg: "get total rank fail" });
    return;
  }
}

//function for compare user score
function compare(value: any) {
  // order by desc
  return function (key1: string, key2: string): number {
    let user1 = +key1[value];
    let user2 = +key2[value];
    return user2 - user1;
  };
}

export default rankRoutes;

// Command to run test: npm run score

// class Score {
//   private creation: number;
//   private reaction: number;
//   private completion: number;

//   constructor(creation = 100, reaction = 10, completion = 100) {
//     this.creation = creation;
//     this.reaction = reaction;
//     this.completion = completion;
//   }
//   get = () => {
//     return {
//       creation: this.creation,
//       reaction: this.reaction,
//       completion: this.completion,
//     };
//   };
// }
//destruction object
// const playerScore = new Score();
// const { creation, reaction, completion } = playerScore.get();
// console.log(creation);
// console.log(reaction);
// console.log(completion);
