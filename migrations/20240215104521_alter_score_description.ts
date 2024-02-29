import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("score_description", (table) => {
    table.integer("score_change");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("score_description", (table) => {
    table.dropColumn("score_change");
  });
}
