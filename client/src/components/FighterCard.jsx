//TODO. Have it re-sort list after editing. Right now, it sends a newly edited fighter to bottom of list, regardless of id.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FighterCard({ fighter, onFighterChanged, token }) {
  const navigate = useNavigate();
  //True/false to bring up an Edit menu when clicking the edit button
  const [isEditing, setIsEditing] = useState(false);
  const [editFighter, setEditFighter] = useState({
    name: fighter.name,
    health: fighter.health,
    attack: fighter.attack,
    defense: fighter.defense,
    ability_id: fighter.ability_id ?? "",
  });
  const [abilities, setAbilities] = useState([]);

  //Get the list of abilities, so editing can access them to allow fighters to change abilities.
  useEffect(() => {
    fetch("http://localhost:3000/api/abilities", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setAbilities(data))
      .catch((error) => {
        console.error("Error fetching abilities:", error);
      });
  }, []);

  //Do this when the delete button is clicked
  const handleDelete = () => {
    fetch(`http://localhost:3000/api/fighters/${fighter.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Deleted fighter:", data);
        onFighterChanged();
      })
      .catch((error) => {
        console.error("Error deleting fighter:", error);
      });
  };

  const handleSave = () => {
    const updatedFighter = {
      name: editFighter.name,
      health: Number(editFighter.health),
      attack: Number(editFighter.attack),
      defense: Number(editFighter.defense),
      ability_id:
        editFighter.ability_id === "" ? null : Number(editFighter.ability_id),
    };

    fetch(`http://localhost:3000/api/fighters/${fighter.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFighter),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Updated fighter:", data);
        onFighterChanged();
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating fighter:", error);
      });
  };

  return (
    <div key={fighter.id}>
      <h3>{fighter.name}</h3>
      {isEditing && (
        <div>
          <div>
            <label>Name: </label>
            <input
              type="text"
              value={editFighter.name}
              onChange={(event) =>
                setEditFighter({
                  ...editFighter,
                  name: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Health: </label>
            <input
              type="number"
              value={editFighter.health}
              onChange={(event) =>
                setEditFighter({
                  ...editFighter,
                  health: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Attack: </label>
            <input
              type="number"
              value={editFighter.attack}
              onChange={(event) =>
                setEditFighter({
                  ...editFighter,
                  attack: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Defense: </label>
            <input
              type="number"
              value={editFighter.defense}
              onChange={(event) =>
                setEditFighter({
                  ...editFighter,
                  defense: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Ability: </label>
            <select
              value={editFighter.ability_id}
              onChange={(event) =>
                setEditFighter({
                  ...editFighter,
                  ability_id: event.target.value,
                })
              }
            >
              <option value="">No ability</option>

              {abilities.map((ability) => (
                <option key={ability.id} value={ability.id}>
                  {ability.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleSave}>Save</button>
        </div>
      )}
      <p>Health: {fighter.health}</p>
      <p>Attack: {fighter.attack}</p>
      <p>Defense: {fighter.defense}</p>
      <p>Ability: {fighter.ability_name || "None"}</p>

      <button onClick={handleDelete}>Delete</button>
      <button onClick={() => setIsEditing(true)}>Edit</button>
      <button
        onClick={() =>
          navigate("/battle", {
            state: { playerFighter: fighter },
          })
        }
      >
        Use
      </button>
    </div>
  );
}

export default FighterCard;
