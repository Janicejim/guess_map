import { Knex } from "knex";
import { hashPassword } from "../utils/hash";
import xlsx from "xlsx";
import path from "path";

export async function seed(knex: Knex): Promise<void> {
  let txn = await knex.transaction();
  try {
    // truncate ALL existing entries
    let tables = [
      "collection",
      "check_in",
      "user_award",
      "award",
      "score_record",
      "score_description",
      "store_record",
      "game_history",
      "like_dislike",
      "game",
      "users",
    ];
    for (let table of tables) {
      await txn.raw(`truncate table ${table} restart identity cascade`);
    }

    //get all the excel data:
    let dataWorkbook = xlsx.readFile(path.resolve("utils", "seed.xls"));
    let userData: any = xlsx.utils.sheet_to_json(dataWorkbook.Sheets["users"]);
    let gameData = xlsx.utils.sheet_to_json(dataWorkbook.Sheets["game"]);
    let likeDislikeData = xlsx.utils.sheet_to_json(
      dataWorkbook.Sheets["like_dislike"]
    );
    let gameHistoryData = xlsx.utils.sheet_to_json(
      dataWorkbook.Sheets["game_history"]
    );
    let storeRecordData = xlsx.utils.sheet_to_json(
      dataWorkbook.Sheets["store_record"]
    );
    let scoreDescriptionData = xlsx.utils.sheet_to_json(
      dataWorkbook.Sheets["score_description"]
    );
    let scoreRecordData = xlsx.utils.sheet_to_json(
      dataWorkbook.Sheets["score_record"]
    );
    let awardData = xlsx.utils.sheet_to_json(dataWorkbook.Sheets["award"]);

    // Inserts users

    for (let user of userData) {
      user["password"] = await hashPassword(user.password);
    }

    await txn("users").insert(userData);

    // // Inserts game
    await txn("game").insert(gameData);

    // //insert like and dislike record
    await txn("like_dislike").insert(likeDislikeData);

    // //insert game_history:
    await txn("game_history").insert(gameHistoryData);

    // //insert store_record:
    await txn("store_record").insert(storeRecordData);

    // //insert score_description:
    await txn("score_description").insert(scoreDescriptionData);

    // //insert score_record:
    await txn("score_record").insert(scoreRecordData);
    //insert award:
    await txn("award").insert(awardData);

    await txn.commit();
  } catch (e) {
    console.log(e);
    await txn.rollback();
  }
}
