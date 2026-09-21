const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "arena_clash",
  password: "8bbfa*7eE",
  port: 5432,
});

client.connect();

client.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Database connected:", result.rows[0]);
  }
});

module.exports = client;
