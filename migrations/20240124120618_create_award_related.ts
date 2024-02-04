import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("award"))) {
    await knex.schema.createTable("award", (table) => {
      table.increments();
      table.string("image").notNullable();
      table.string("name").notNullable();
      table.integer("score").notNullable();
      table.integer("quantity").notNullable();
      table
        .enum("status", ["active", "inactive"])
        .defaultTo("active")
        .notNullable();
      table.timestamps(false, true);
    });
  }
  if (!(await knex.schema.hasTable("user_award"))) {
    await knex.schema.createTable("user_award", (table) => {
      table.increments();
      table.integer("award_id").references("award.id").notNullable();
      table.integer("user_id").references("users.id").notNullable();
      table.integer("score").notNullable();
      table.timestamps(false, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_award");
  await knex.schema.dropTableIfExists("award");
}
