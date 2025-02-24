import { Knex } from "knex";

class UserService {
  constructor(private knex: Knex) { }

  async getUserMyEmail(email: string) {
    return await this.knex.select("*").from("users").where("email", email);
  }

  async getUserInfo(id: number) {
    return (
      await this.knex.raw(
        `select users.id,name,email,profile_image ,description ,role,COALESCE(total_score,0) as total_score,COALESCE(check_in_number,0) as check_in_number,COALESCE(win_number,0) as win_number,COALESCE(loss_number,0) as loss_number from users
        full join (select user_id,sum(score_change) as total_score from score_record group by user_id) as score on users.id=score.user_id
        full join (select user_id,count(user_id) as check_in_number from check_in  where status='active' and user_id=? group by user_id) as check_in_record on check_in_record.user_id=users.id
        full join (select user_id,count(user_id) as win_number from game_history where user_id=? and is_win=true group by user_id) as win_record on win_record.user_id=users.id
        full join (select user_id,count(user_id) as loss_number from game_history where user_id=? and is_win=false and attempts=0 group by user_id) as loss_record on loss_record.user_id=users.id
        where users.id=?
  `,
        [id, id, id, id]
      )
    ).rows[0];
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
      let userData = await txn("users").insert(data).returning("*");

      let newUserScoreDesId = await this.getScoreDescriptionId("新玩家");
      await txn("score_record").insert({
        user_id: userData[0].id,
        score_change: 100,
        score_description_id: newUserScoreDesId,
      });
      await txn.commit();
      return userData
    } catch (e) {
      console.log(e);
      await txn.rollback();
      return [];
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
