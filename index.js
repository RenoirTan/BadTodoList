import bodyParser from "body-parser";
import express from "express";
import knex from "knex";


const DBPATH = "db/todos.db";
const TODOS = "Todos";


const app = express();
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const client = knex({
  client: "sqlite3",
  connection: {
    filename: DBPATH
  },
  useNullAsDefault: true
});


let todosExist = await client.schema.hasTable(TODOS);
if (!todosExist) {
  await client.schema.createTable(TODOS, table => {
    table.increments("id", {primaryKey: true}).unique().notNullable();
    table.string("title", 64); // Set max length to 64
    table.text("body")
  });
}


app.get("/", async (req, res) => {
  const result = await client
    .select("id", "title")
    .from(TODOS);
  res.render("index", {todoItems: result});
});

app.get("/item/:id", async (req, res) => {
  const id = req.params.id;
  const result = await client
    .select("*")
    .from(TODOS)
    .where("id", id);
  if (result.length == 0) {
    res.status(404).render("404");
  } else {
    res.render("item", {item: result[0]});
  }
});

app.post("/item/delete/:id", async (req, res) => {
  const id = req.params.id;
  const result = await client(TODOS).delete().where("id", id);
  if (result == 1) {
    res.redirect("/");
  } else {
    res.status(404).render("404");
  }
});

app.get("/new", async (req, res) => {
  res.render("new");
});

app.post("/new", async (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  if (title.length == 0 || title.length > 64) {
    res.status(400).render("400", {errMsg: "Title must be between 1 and 64 characters."});
  }
  const result = await client(TODOS).insert({title: title, body: body});
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