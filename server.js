const client = require("./db");
const express = require("express");
//const fighters = require("./fighters"); Don't need now since pulling from database api instead of a specific file.

const app = express();
const PORT = 3000;

app.use(express.json());

// app.get("/api/fighters", (req, res) => {
//   res.json(fighters);
// }); //replaced with api version

//API version
// app.get("/api/fighters", async (req, res) => {
//   const SQL = `SELECT * FROM fighters`;
//   const response = await client.query(SQL);
//   return res.json(response.rows);
// });

//Shows ability details too. Format to look decent later.
app.get("/api/fighters", async (req, res) => {
  const SQL = `
    SELECT
      fighters.*,
      abilities.name AS ability_name,
      abilities.type AS ability_type,
      abilities.value AS ability_value,
      abilities.duration AS ability_duration,
      abilities.description AS ability_description,
      abilities.cooldown AS ability_cooldown
    FROM fighters
    JOIN abilities
      ON fighters.ability_id = abilities.id;
  `;

  const response = await client.query(SQL);

  return res.json(response.rows);
});

//Outdated

// app.get("/api/fighters/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const fighter = fighters.find((fighter) => fighter.id === id);
//   if (!fighter) {
//     return res.status(404).json({ error: "Fighter not found" });
//   }

//   res.json(fighter);
// });

//API verson
app.get("/api/fighters/:id", async (req, res) => {
  const SQL = `SELECT * FROM fighters WHERE id = $1`;
  const response = await client.query(SQL, [req.params.id]);

  if (response.rows.length === 0) {
    return res.status(404).json({ error: "Fighter not found" });
  }

  return res.json(response.rows[0]);
});

//Outdated version
// app.post("/api/fighters", (req, res) => {
//   const newFighter = req.body;
//   newFighter.id = fighters.length + 1;
//   if (!newFighter.name) {
//     throw new Error("Needs a name");
//   } else if (!newFighter.health || newFighter.health < 0) {
//     throw new Error("Needs a non zero, non negative health");
//   } else if (!newFighter.attack || newFighter.attack < 0) {
//     throw new Error("Needs an non negative attack value.");
//   } else if (!newFighter.defense || newFighter.defense < 0) {
//     throw new Error("Needs a non negative defense value");
//   } else if (!newFighter.ability) {
//     throw new Error("Needs an ability"); //Not everyone needs an ability, change this later.
//   } else {
//     fighters.push(newFighter);
//     res.status(201).json(newFighter);
//   }
// });

//API version
app.post("/api/fighters", async (req, res) => {
  const { name, health, attack, defense, ability_id } = req.body;

  //Letting things be negative but not at time of insertion
  if (health < 0 || attack < 0 || defense < 0) {
    return res.status(400).json({
      error:
        "Health, attack, and defense cannot be negative when creating a fighter",
    });
  }

  const SQL = `
    INSERT INTO fighters (name, health, attack, defense, ability_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const response = await client.query(SQL, [
    name,
    health,
    attack,
    defense,
    ability_id,
  ]);

  return res.status(201).json(response.rows[0]);
});

//Outdated version
// app.patch("/api/fighters/:id", (req, res) => {
//   const id = Number(req.params.id);

//   const fighter = fighters.find((fighter) => fighter.id === id);

//   if (!fighter) {
//     return res.status(404).json({ error: "Fighter not found" });
//   }

//   const updates = req.body;

//   Object.assign(fighter, updates);

//   res.json(fighter);
// });

//API version
app.patch("/api/fighters/:id", async (req, res) => {
  const { name, health, attack, defense, ability_id } = req.body;

  //COALESCE lets certain fields be updated without having to update the whole fighter object
  const SQL = `
    UPDATE fighters
    SET
      name = COALESCE($1, name),
      health = COALESCE($2, health),
      attack = COALESCE($3, attack),
      defense = COALESCE($4, defense),
      ability_id = COALESCE($5, ability_id)
    WHERE id = $6
    RETURNING *;
  `;

  const response = await client.query(SQL, [
    name,
    health,
    attack,
    defense,
    ability_id,
    req.params.id,
  ]);

  if (response.rows.length === 0) {
    return res.status(404).json({ error: "Fighter not found" });
  }

  return res.json(response.rows[0]);
});

//Outdated
// app.delete("/api/fighters/:id", (req, res) => {
//   const id = Number(req.params.id);

//   const fighterIndex = fighters.findIndex((fighter) => fighter.id === id);

//   if (fighterIndex === -1) {
//     return res.status(404).json({ error: "Fighter not found" });
//   }

//   const deletedFighter = fighters.splice(fighterIndex, 1);

//   res.json(deletedFighter[0]);
// });

//API version
app.delete("/api/fighters/:id", async (req, res) => {
  const SQL = `
    DELETE FROM fighters
    WHERE id = $1
    RETURNING *;
  `;

  const response = await client.query(SQL, [req.params.id]);

  if (response.rows.length === 0) {
    return res.status(404).json({ error: "Fighter not found" });
  }

  return res.json(response.rows[0]);
});

app.listen(PORT, () => {
  console.log(`Arena Clash API running on http://localhost:${PORT}`);
});
