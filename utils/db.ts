import { env } from "./env";

import Knex from "knex";

const knexConfig = require("../knexfile");

export let knex = Knex(knexConfig[env.NODE_ENV || "development"]);
