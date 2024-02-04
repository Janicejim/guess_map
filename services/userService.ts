import { Knex } from "knex";

class UserService {
  constructor(private knex: Knex) {}

  async getUserMyEmail(email: string) {
    return await this.knex.select("*").from("users").where("email", email);
  }

  async getUserInfo(id: number) {
    return (
      await this.knex.raw(
        `select users.id,name,email,profile_image ,description ,role,total_score from users full join (select user_id,sum(score_change) as total_score from score_record group by user_id) as score on users.id=score.user_id where users.id=?
  `,
        [id]
      )
    ).rows[0];
  }

  async getLevel(min_score: number, max_score: number) {
    return (
      await this.knex.raw(
        `select name as level from level where min_score<=? and max_score>=?`,
        [min_score, max_score]
      )
    ).rows;
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

  async createUser(data: {
    name: string;
    email: string;
    profile_image: string;
    password: string;
    role: string;
  }) {
    let txn = await this.knex.transaction();
    try {
      let [{ id }] = await txn("users").insert(data).returning("id");

      let newUserScoreDesId = await this.getScoreDescriptionId("新玩家");
      await txn("score_record").insert({
        user_id: id,
        score_change: 100,
        score_description_id: newUserScoreDesId,
      });

      await txn.commit();
      return id;
    } catch (e) {
      await txn.rollback();
    }
  }

  async updateProfile(
    data: {
      name: string;
      profile_image?: string;
      description: string;
    },
    id: number
  ) {
    await this.knex("users").update(data).where("id", id);
  }
}

export default UserService;
