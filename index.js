const pg = require("pg");
const express = require("express");
require("dotenv").config();
const client = new pg.Client();

const app = express();
const PORT = 3000;
app.use(express.json());

app.get("/flavors", async (req, res) => {
  try {
    const SQL = `SELECT * FROM flavors ORDER BY created_at DESC;`;
    const { rows } = await client.query(SQL);
    res.send(rows);
  } catch (err) {
    console.error(err);
  }
});

app.get("/flavors/:id", async (req, res) => {
  try {
    const SQL = `SELECT * FROM flavors WHERE id=$1;`;
    const { rows } = await client.query(SQL, [req.params.id]);
    res.send(rows);
  } catch (err) {
    console.log(err);
  }
});

app.post("/flavors", async (req, res) => {
  try {
    console.log(req.body);
    const SQL = `INSERT INTO flavors(name,is_favorite) VALUES($1,$2) RETURNING *`;
    const { rows } = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
    ]);
    res.send(rows);
  } catch (err) {
    console.error(err);
  }
});

app.put("/flavors/:id", async (req, res) => {
  try {
    const SQL = `UPDATE flavors SET name=$1, is_favorite=$2, updated_at=now() WHERE id=$3 RETURNING *;`;
    const { rows } = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    console.log(rows);
    res.send(rows[0]);
  } catch (err) {
    res.send(err);
  }
});

app.delete("/flavors/:id", async (req, res) => {
  try {
    const SQL = "DELETE FROM flavors WHERE id=$1 RETURNING *;";
    const { rows } = await client.query(SQL, [req.params.id]);
    console.log(rows);
    res.send(rows);
  } catch (err) {
    res.send(err);
  }
});

const init = async () => {
  try {
    await client.connect();
    console.log("Connected to db");
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors (
id SERIAL PRIMARY KEY,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
name VARCHAR(255) NOT NULL,
is_favorite BOOLEAN
);`;
    await client.query(SQL);
    console.log("tables created");
    SQL = `INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', True);
INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', False);
INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', False);`;
    await client.query(SQL);
    console.log("data seeded");
  } catch (err) {
    console.error("Error during initialization", err.stack);
  }
};

app.listen(PORT, () => {
  console.log(`server alive on port! ${PORT}`);
});

init();
