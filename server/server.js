const client = require("./db");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "WHAT AM I DOING";
//const fighters = require("./fighters"); Don't need now since pulling from database api instead of a specific file.

//validates tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);

    req.user = user;

    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }
};

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Arena Clash API is running!");
});

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
app.get("/api/fighters", authenticateToken, async (req, res) => {
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
    LEFT JOIN abilities
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
app.post("/api/fighters", authenticateToken, async (req, res) => {
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
app.patch("/api/fighters/:id", authenticateToken, async (req, res) => {
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
app.delete("/api/fighters/:id", authenticateToken, async (req, res) => {
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

//Get abilities and sort them for when i want to use the dropdown menu to select abilities.
app.get("/api/abilities", authenticateToken, async (req, res) => {
  const SQL = `
    SELECT *
    FROM abilities
    ORDER BY id;
  `;

  const response = await client.query(SQL);

  return res.json(response.rows);
});

//Adding new users
app.post("/api/users", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const SQL = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username;
    `;

    const response = await client.query(SQL, [username, hashedPassword]);

    res.status(201).json(response.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

//Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const SQL = `
    SELECT * FROM users
    WHERE username = $1;
  `;

  const response = await client.query(SQL, [username]);

  if (response.rows.length === 0) {
    return res.status(401).json({
      error: "Invalid username or password",
    });
  }

  const user = response.rows[0];

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({
      error: "Invalid username or password",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  res.json({
    token: token,
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Arena Clash API running on http://localhost:${PORT}`);
});
