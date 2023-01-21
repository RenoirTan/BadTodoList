import bodyParser from "body-parser";
import express from "express";
import knex from "knex";


const app = express();
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const client = knex({
  client: "sqlite3",
  connection: {
    filename: "db/todos.db"
  },
  useNullAsDefault: true
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
  table.text("body")
});


app.get("/", async (req, res) => {
  const result = await client
    .select("id", "title")
    .from("Todos");
  res.render("index", {todoItems: result});
});

app.get("/item/:id", async (req, res) => {
  const id = req.params.id;
  const result = await client
    .select("*")
    .from("Todos")
    .where("id", id);
  if (result.length == 0) {
    res.status(404).render("404");
  } else {
    res.render("item", {item: result[0]});
  }
});

app.get("/new", async (req, res) => {
  res.render("new");
});

app.post("/new", async (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const result = await client("Todos").insert({title: title, body: body});
  if (result.length == 0) {
    res.status(500).render("500", {errMsg: "Couldn't add item!"});
  } else {
    res.redirect(`/item/${result[0]}`);
  }
});

app.all("*", (req, res) => {
  res.status(404).render("404");
});

app.listen(3000);