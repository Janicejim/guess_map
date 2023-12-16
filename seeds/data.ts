import { Knex } from "knex";
import { hashPassword } from "../utils/hash";

export async function seed(knex: Knex): Promise<void> {
  let txn = await knex.transaction();
  try {
    // truncate ALL existing entries
    let tables = [
      "level",
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

    // Inserts users

    let userIds = await txn("users")
      .insert([
        {
          name: "admin",
          email: "admin@admin",
          password: await hashPassword("admin"),
          role: "admin",
        },
        {
          name: "user1",
          email: "user1@user",
          password: await hashPassword("user"),
          role: "user",
        },
        {
          name: "user2",
          email: "user2@user",
          password: await hashPassword("user"),
          role: "user",
        },
        {
          name: "user3",
          email: "user3@user",
          password: await hashPassword("user"),
          role: "user",
        },
        {
          name: "user4",
          email: "user4@user",
          password: await hashPassword("user"),
          role: "user",
        },
      ])
      .returning("id");

    // Inserts game
    let gameIds = await txn("game")
      .insert([
        {
          user_id: userIds[1].id,
          media: "media-1628996651049",
          target_location: " (22.312423386583422,114.21697854995728)",
          hints_1: "係觀塘",
          hints_2: "有花有草有水有人有狗",
          answer_name: "觀塘海濱花園",
          answer_address: "觀塘海濱道80號觀塘海濱花園",
          answer_description:
            "園內海濱步道全長約一公里。遊人在步道上不但可以近距離欣賞東九龍新地標── 啟德郵輪碼頭和跑道公園，更可遠眺港島東的璀璨夜景，飽覽維多利亞港和鯉魚門的風光。",
        },
      ])
      .returning("id");

    //insert like and dislike record
    await txn("like_dislike").insert([
      {
        user_id: userIds[2].id,
        game_id: gameIds[0].id,
        type: "like",
      },
      { user_id: userIds[3].id, game_id: gameIds[0].id, type: "dislike" },
    ]);

    //insert game_history:
    await txn("game_history").insert([
      {
        user_id: userIds[2].id,
        game_id: gameIds[0].id,
        attempts: 2,
        is_win: false,
      },
      {
        user_id: userIds[3].id,
        game_id: gameIds[0].id,
        attempts: 0,
        is_win: false,
      },
      {
        user_id: userIds[4].id,
        game_id: gameIds[0].id,
        attempts: 1,
        is_win: true,
      },
    ]);

    //insert store_record:
    await txn("store_record").insert([
      {
        user_id: userIds[0].id,
        game_id: gameIds[0].id,
        amount_change: 100,
      },
      {
        user_id: userIds[3].id,
        game_id: gameIds[0].id,
        amount_change: 100,
      },
    ]);

    //insert score_description:
    let descriptionIds = await txn("score_description")
      .insert([
        {
          description: "創建遊戲獎勵",
        },
        {
          description: "其他玩家讚好遊戲獎勵",
        },
        {
          description: "其他玩家負評遊戲扣減",
        },
        {
          description: "創建者瓜分成功作答獎勵",
        },
        {
          description: "作答失敗扣減",
        },
        {
          description: "作答成功瓜分獎勵",
        },
        {
          description: "舉報遊戲獎勵",
        },
        {
          description: "遊戲下架，被扣積分返回",
        },
      ])
      .returning("id");

    //insert score_record:
    await txn("score_record").insert([
      {
        user_id: userIds[1].id,
        score_change: 100,
        score_description_id: descriptionIds[0].id,
      },
      {
        user_id: userIds[1].id,
        score_change: 10,
        score_description_id: descriptionIds[1].id,
      },
      {
        user_id: userIds[1].id,
        score_change: -10,
        score_description_id: descriptionIds[2].id,
      },
      {
        user_id: userIds[3].id,
        score_change: -100,
        score_description_id: descriptionIds[4].id,
      },
      {
        user_id: userIds[4].id,
        score_change: 100,
        score_description_id: descriptionIds[5].id,
      },
      {
        user_id: userIds[1].id,
        score_change: 100,
        score_description_id: descriptionIds[3].id,
      },
    ]);

    //insert level:
    await txn("level").insert([
      {
        name: "level 1",
        min_score: 0,
        max_score: 1000,
      },
    ]);

    await txn.commit();
  } catch (e) {
    console.log(e);
    await txn.rollback();
  }
}
