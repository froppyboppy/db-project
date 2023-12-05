// @ts-check

import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { fileURLToPath } from "url";

/** @type {Database<sqlite3.Database, sqlite3.Statement> | undefined} */
let db

export async function connectDb() {
    return db ??= await open({
        filename: "./identifier.sqlite",
        driver: sqlite3.Database,
    });
}

// /**
//  * @param {FormDataEntryValue} val
//  */
// export function escapeDbStr(val) {
//     return val.toString().replaceAll('"', '""').replaceAll("'", "''");
// }