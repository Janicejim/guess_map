import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("game", (table) => {
    table.string("answer_name");
    table.string("answer_address");
    table.text("answer_description");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("game", (table) => {
    table.dropColumns("answer_name", "answer_address", "answer_description");
  });
}
