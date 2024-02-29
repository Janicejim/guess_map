import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("level");
}

export async function down(knex: Knex): Promise<void> {
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
