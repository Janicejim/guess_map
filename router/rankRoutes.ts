import express, { Request, Response } from "express";
import { knex } from "../utils/db";
import { isLoggedIn } from "../utils/guard";
import { logger } from "../utils/logger";

const rankRoutes = express.Router();

//score route
rankRoutes.get("/rank", isLoggedIn, getRank);

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
    logger.error(e);
    res.json({ success: false, msg: e });
  }
}

export default rankRoutes;
