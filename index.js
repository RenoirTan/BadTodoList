import express from "express";
import knex from "knex";


const app = express();
app.set("view engine", "pug");

const client = knex({
  client: "sqlite3",
  connection: {
    filename: "db/todos.db"
  }
});


/**
 * CREATE TABLE Todos IF NOT EXIST (
 *     id INTEGER AUTOINCREMENT PRIMARY KEY,
 *     title varchar(64),
 *     body TEXT
 * );
 */
await client.schema.createTableIfNotExists("Todos", table => {
  table.increments("id", {primaryKey: true});
  table.string("title", 64); // Set max length to 64
  table.string("body")
});


app.get("/", async (req, res) => {
  console.log("GET /");
  const result = await client
    .select("*")
    .from("Todos");
  res.render("index", {todoItems: result});
});

app.listen(3000);