import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("users"))) {
    await knex.schema.createTable("users", (table) => {
      table.increments();
      table.string("name");
      table.string("email").notNullable();
      table.string("password").notNullable;
      table.string("profile_image");
      table.text("description");
      table.enum("role", ["admin", "user"]).notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("game"))) {
    await knex.schema.createTable("game", (table) => {
      table.increments();
      table.integer("user_id").references("users.id").notNullable();
      table.string("media").notNullable();
      table.point("target_location").notNullable();
      table.text("hints_1").notNullable();
      table.text("hints_2").notNullable();
      table
        .enum("status", ["active", "inactive", "completed"])
        .defaultTo("active")
        .notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("like_dislike"))) {
    await knex.schema.createTable("like_dislike", (table) => {
      table.increments();
      table.integer("game_id").references("game.id").notNullable();
      table.integer("user_id").references("users.id").notNullable();
      table.enum("type", ["like", "dislike"]).notNullable();
      table.timestamps(false, true);
    });
  }
  if (!(await knex.schema.hasTable("game_history"))) {
    await knex.schema.createTable("game_history", (table) => {
      table.increments();
      table.integer("game_id").references("game.id");
      table.integer("user_id").references("users.id");
      table.integer("attempts").defaultTo(2).notNullable();
      table.boolean("is_win").defaultTo("false").notNullable();
      table.timestamps(false, true);
    });
  }
  if (!(await knex.schema.hasTable("store_record"))) {
    await knex.schema.createTable("store_record", (table) => {
      table.increments();
      table.integer("game_id").references("game.id").notNullable();
      table.integer("user_id").references("users.id").notNullable();
      table.integer("amount_change").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("score_description"))) {
    await knex.schema.createTable("score_description", (table) => {
      table.increments();
      table.text("description").notNullable();
      table.timestamps(false, true);
    });
  }
  if (!(await knex.schema.hasTable("score_record"))) {
    await knex.schema.createTable("score_record", (table) => {
      table.increments();
      table.integer("user_id").references("users.id").notNullable();
      table.integer("score_change").notNullable();
      table
        .integer("score_description_id")
        .references("score_description.id")
        .notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("level"))) {
    await knex.schema.createTable("level", (table) => {
      table.increments();
      table.string("name").notNullable();
      table.integer("max_score").notNullable();
      table.integer("min_score").notNullable();
      table.timestamps(false, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("level");
  await knex.schema.dropTableIfExists("score_record");
  await knex.schema.dropTableIfExists("score_description");
  await knex.schema.dropTableIfExists("store_record");
  await knex.schema.dropTableIfExists("game_history");
  await knex.schema.dropTableIfExists("like_dislike");
  await knex.schema.dropTableIfExists("game");
  await knex.schema.dropTableIfExists("users");
}
