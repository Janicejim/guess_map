import { Knex } from "knex";

export class CheckInService {
  constructor(private knex: Knex) {}

  async getCollectionByUser(user_id: number) {
    return await this.knex.raw(
      `select * from collection join game on collection.game_id=game.id where collection.user_id=? and status='active' order by collection.created_at desc`,
      [user_id]
    );
  }

  async addCollection(user_id: number, game_id: number) {
    await this.knex("collection").insert({
      user_id,
      game_id,
      status: "active",
    });

    return;
  }

  async checkOldCollectionRecord(user_id: number, game_id: number) {
    return await this.knex("collection")
      .select("*")
      .where("user_id", user_id)
      .andWhere("game_id", game_id);
  }
  async updatedCollectionRecordStatus(id: number, status: string) {
    await this.knex("collection")
      .update({
        status,
      })
      .where("id", id);
    return;
  }

  async addCheckInRecord(data: {
    user_id: number;
    game_id: number;
    status: string;
  }) {
    return (await this.knex("check_in").insert(data).returning("id"))[0].id;
  }

  async updateCheckInData(data: {
    id: number;
    image?: string;
    message?: string;
  }) {
    await this.knex("check_in").update(data).where("id", data.id);
    return;
  }

  async checkOldCheckInRecord(user_id: number, game_id: number) {
    return await this.knex("check_in")
      .select("*")
      .where("user_id", user_id)
      .andWhere("game_id", game_id)
      .andWhere("status", "active");
  }
  async getAllCheckInRecordOfUser(user_id: number) {
    return await this.knex("check_in")
      .select("*")
      .where("user_id", user_id)
      .andWhere("status", "active");
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
}

export default CheckInService;
