import { useEffect, useState } from "react"; //imports

function AddFighter({ onFighterAdded }) {
  //import abilities to be able to show them
  const [abilities, setAbilities] = useState([]);
  //Import all the get/sets for the stats.
  const [name, setName] = useState("");
  const [health, setHealth] = useState("");
  const [attack, setAttack] = useState("");
  const [defense, setDefense] = useState("");
  const [abilityId, setAbilityId] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/abilities")
      .then((response) => response.json())
      .then((data) => setAbilities(data))
      .catch((error) => {
        console.error("Error fetching abilities:", error);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const newFighter = {
      name: name,
      health: Number(health),
      attack: Number(attack),
      defense: Number(defense),
      ability_id: abilityId === "" ? null : Number(abilityId),
    };

    fetch("http://localhost:3000/api/fighters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newFighter),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("New fighter:", data);
        onFighterAdded();
      })
      .catch((error) => {
        console.error("Error adding fighter:", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name: </label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div>
        <label>Health: </label>
        <input
          type="number"
          value={health}
          onChange={(event) => setHealth(event.target.value)}
        />
      </div>

      <div>
        <label>Attack: </label>
        <input
          type="number"
          value={attack}
          onChange={(event) => setAttack(event.target.value)}
        />
      </div>

      <div>
        <label>Defense: </label>
        <input
          type="number"
          value={defense}
          onChange={(event) => setDefense(event.target.value)}
        />
      </div>

      <div>
        <label>Ability: </label>
        <select
          value={abilityId}
          onChange={(event) => setAbilityId(event.target.value)}
        >
          <option value="">No ability</option>

          {abilities.map((ability) => (
            <option key={ability.id} value={ability.id}>
              {ability.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Add Fighter</button>
    </form>
  );
}

export default AddFighter;
