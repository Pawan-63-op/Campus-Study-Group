import { pool  } from "./db.js";
import {sql, txq, sql_transact} from "./sql_connector.js";
const rows = await sql`SELECT * FROM users WHERE id = ${1}`;
console.log(rows[0].name);