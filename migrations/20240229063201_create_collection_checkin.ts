import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("collection"))) {
    await knex.schema.createTable("collection", (table) => {
      table.increments();
      table.integer("user_id").references("users.id").notNullable();
      table.integer("game_id").references("game.id").notNullable();
      table
        .enum("status", ["active", "inactive"])
        .defaultTo("active")
        .notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("check_in"))) {
    await knex.schema.createTable("check_in", (table) => {
      table.increments();
      table.integer("user_id").references("users.id").notNullable();
      table.integer("game_id").references("game.id").notNullable();
      table
        .enum("status", ["active", "inactive"])
        .defaultTo("active")
        .notNullable();
      table.string("image").nullable();
      table.string("message").nullable();

      table.timestamps(false, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("check_in");
  await knex.schema.dropTableIfExists("collection");
}
