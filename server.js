const express = require("express");
const fighters = require("./fighters");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/fighters", (req, res) => {
  res.json(fighters);
});

app.get("/api/fighters/:id", (req, res) => {
  const id = Number(req.params.id);
  const fighter = fighters.find((fighter) => fighter.id === id);
  if (!fighter) {
    return res.status(404).json({ error: "Fighter not found" });
  }

  res.json(fighter);
});

app.post("/api/fighters", (req, res) => {
  const newFighter = req.body;
  newFighter.id = fighters.length + 1;
  if (!newFighter.name) {
    throw new Error("Needs a name");
  } else if (!newFighter.health || newFighter.health < 0) {
    throw new Error("Needs a non zero, non negative health");
  } else if (!newFighter.attack || newFighter.attack < 0) {
    throw new Error("Needs an non negative attack value.");
  } else if (!newFighter.defense || newFighter.defense < 0) {
    throw new Error("Needs a non negative defense value");
  } else if (!newFighter.ability) {
    throw new Error("Needs an ability"); //Not everyone needs an ability, change this later.
  } else {
    fighters.push(newFighter);
    res.status(201).json(newFighter);
  }
});

app.patch("/api/fighters/:id", (req, res) => {
  const id = Number(req.params.id);

  const fighter = fighters.find((fighter) => fighter.id === id);

  if (!fighter) {
    return res.status(404).json({ error: "Fighter not found" });
  }

  const updates = req.body;

  Object.assign(fighter, updates);

  res.json(fighter);
});

app.delete("/api/fighters/:id", (req, res) => {
  const id = Number(req.params.id);

  const fighterIndex = fighters.findIndex((fighter) => fighter.id === id);

  if (fighterIndex === -1) {
    return res.status(404).json({ error: "Fighter not found" });
  }

  const deletedFighter = fighters.splice(fighterIndex, 1);

  res.json(deletedFighter[0]);
});

app.listen(PORT, () => {
  console.log(`Arena Clash API running on http://localhost:${PORT}`);
});
