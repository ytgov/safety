import * as knex from "knex";

exports.up = async function (knex: knex.Knex, Promise: any) {
  await knex.schema.createTable("action_TEST", function (table) {
    table.string("code", 8).primary().notNullable();
    table.string("name", 256).notNullable();
    table.string("description", 4096).nullable();
    table.string("department", 8).nullable().references("depertment.code");
  });
};

exports.down = async function (knex: knex.Knex, Promise: any) {
  await knex.schema.dropTable("action_TEST");
};
