import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Battle.css";

function Battle({ fighters }) {
  // Gets the fighter object loaded from the roster when clicking "Use".
  const location = useLocation();
  const playerFighter = location.state?.playerFighter;
  const navigate = useNavigate();

  // Battle starts as null until we initialize it.
  const [battle, setBattle] = useState(null);

  // Makes the messages array.
  const [messages, setMessages] = useState(["Battle ready!", "", "", ""]);

  // Initialize the battle once we have a player fighter.
  useEffect(() => {
    if (!playerFighter || fighters.length < 1) {
      return;
    }

    // Loading up a random opponent.
    const randomOpponent =
      fighters[Math.floor(Math.random() * fighters.length)];

    setBattle({
      player: {
        fighter: playerFighter,
        hp: playerFighter.health,
        cooldown: 0,
        damageReduction: 0,
      },
      opponent: {
        fighter: randomOpponent,
        hp: randomOpponent.health,
        cooldown: 0,
        damageReduction: 0,
      },
      status: "active",
    });
  }, [playerFighter, fighters]);

  // Handles the message display.
  const addMessage = (message) => {
    setMessages((currentMessages) => [
      currentMessages[1],
      currentMessages[2],
      currentMessages[3],
      message,
    ]);
  };

  if (fighters.length < 1) {
    return <p>Not enough fighters to start a battle.</p>;
  }

  // If you tried to load the battle page without loading a fighter first.
  if (!playerFighter) {
    return <p>Please select a fighter first.</p>;
  }

  if (!battle) {
    return <p>Loading battle...</p>;
  }

  //General function to handle taking damage. Hands in the fighters and puts them in attacker or defender role,
  // then the damage that they should be taking, whether from a normal attack or ability.
  const takeDamage = (attacker, defender, baseDamage) => {
    //attack minus defense
    let damage = baseDamage - defender.fighter.defense;

    //attack minus defense, then percentage damage reduction for if they have things like Shield Wall up.
    if (defender.damageReduction > 0) {
      damage = damage * (1 - defender.damageReduction / 100);
    }

    //For now, damage reduction lasts for one incoming attack
    defender.damageReduction = 0;

    damage = Math.max(0, damage);
    defender.hp -= damage;

    return damage;
  };

  //Function to decrease cooldowns
  const decreaseCooldown = (cooldown, cooldownBy) => {
    return Math.max(0, cooldown - cooldownBy);
  };

  //Function for clicking the ability button
  const useAbility = (user, target) => {
    const ability = user.fighter;

    if (user.cooldown > 0) {
      return {
        success: false,
        message: `${user.fighter.name}'s ability is on cooldown for ${user.cooldown} more turn(s).`,
      };
    }

    //     //default as option if no ability
    let effect = 0;

    if (ability.ability_type === "damage") {
      effect = takeDamage(user, target, ability.ability_value);
    }

    if (ability.ability_type === "heal") {
      user.hp += ability.ability_value;

      if (user.hp > user.fighter.health) {
        user.hp = user.fighter.health;
      }

      effect = ability.ability_value;
    }

    if (ability.ability_type === "damage_reduction") {
      user.damageReduction = ability.ability_value;
      effect = ability.ability_value;
    }

    user.cooldown = ability.ability_cooldown;

    //     //Returns the value of what it did
    return {
      success: true,
      effect: effect,
    };
  };

  //   const handleAbility = () => {
  //
  //     const result = useAbility(battle.player, battle.opponent);

  //     if (!result.success) {
  //       addMessage(result.message);
  //       return;
  //     }

  const handleAbility = () => {
    //Does nothing if battle is over.
    if (battle.status !== "active") {
      return;
    }

    //Check if ability could be used
    const result = useAbility(battle.player, battle.opponent);

    //     //If not, essentially don't do anything until they choose an action that is coded to progress the turn

    if (!result.success) {
      addMessage(result.message);
      return;
    }
    //     //Otherwise, update fight after use.
    const updatedBattle = {
      ...battle,
      player: {
        ...battle.player,
      },
      opponent: {
        ...battle.opponent,
      },
    };

    setBattle(updatedBattle);

    addMessage(
      `${battle.player.fighter.name} used ${battle.player.fighter.ability_name}!`,
    );

    if (battle.opponent.hp <= 0) {
      addMessage(`${battle.opponent.fighter.name} has been defeated!`);

      setBattle({
        ...battle,
        status: "player won",
      });

      return;
    }

    handleAITurn(updatedBattle);
  };

  const handleAITurn = (currentBattle) => {
    const decideAbility = Math.random() < 0.5;
    //Use ability
    if (decideAbility && currentBattle.opponent.cooldown === 0) {
      useAbility(currentBattle.opponent, currentBattle.player);
      //Kill check
      if (currentBattle.player.hp <= 0) {
        addMessage(`${currentBattle.player.fighter.name} has been defeated!`);

        setBattle({
          ...currentBattle,
          status: "ai won",
        });

        return;
      }
      setBattle({
        ...currentBattle,
        player: {
          ...currentBattle.player,
        },
        opponent: {
          ...currentBattle.opponent,
        },
      });

      addMessage(
        `${currentBattle.opponent.fighter.name} used ${currentBattle.opponent.fighter.ability_name}!`,
      );
    }
    //Normal Attack
    else {
      const damage = takeDamage(
        currentBattle.opponent,
        currentBattle.player,
        currentBattle.opponent.fighter.attack,
      );

      if (currentBattle.player.hp <= 0) {
        addMessage(`${currentBattle.player.fighter.name} has been defeated!`);

        setBattle({
          ...currentBattle,
          status: "ai won",
        });

        return;
      }

      //Cooldown ticks after an attack.
      const newCooldown = decreaseCooldown(currentBattle.opponent.cooldown, 1);

      setBattle({
        ...currentBattle,
        player: {
          ...currentBattle.player,
        },
        opponent: {
          ...currentBattle.opponent,
          cooldown: newCooldown,
        },
      });

      addMessage(
        `${currentBattle.opponent.fighter.name} attacks back for ${damage} damage!`,
      );
    }
  };

  //Clicking the attack button
  const handleAttack = () => {
    //Does nothing if battle is over
    if (battle.status !== "active") {
      return;
    }

    const playerDamage = takeDamage(
      battle.player,
      battle.opponent,
      battle.player.fighter.attack,
    );

    addMessage(
      `${battle.player.fighter.name} attacks for ${playerDamage} damage!`,
    );

    //Checks if kill
    if (battle.opponent.hp <= 0) {
      addMessage(`${battle.opponent.fighter.name} has been defeated!`);
      setBattle({
        ...battle,
        status: "player won",
      });
      return;
    }

    //Decrease cooldown
    const newPlayerCooldown = decreaseCooldown(battle.player.cooldown, 1);
    //Testing

    //Updates everything after the turn
    const updatedBattle = {
      ...battle,
      player: {
        ...battle.player,
        cooldown: newPlayerCooldown,
      },
      opponent: {
        ...battle.opponent,
      },
    };

    setBattle(updatedBattle);

    handleAITurn(updatedBattle);
  };

  //Resets the battle state when called.
  const resetBattle = () => {
    const newOpponent = fighters[Math.floor(Math.random() * fighters.length)];

    setBattle({
      player: {
        fighter: playerFighter,
        hp: playerFighter.health,
        cooldown: 0,
        damageReduction: 0,
      },
      opponent: {
        fighter: newOpponent,
        hp: newOpponent.health,
        cooldown: 0,
        damageReduction: 0,
      },
      status: "active",
    });

    setMessages(["Battle ready!", "", "", ""]);
  };

  //What's visible
  return (
    <div>
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Fighter Roster
      </button>
      <h2>Battle</h2>
      <div className="battle-area">
        <div className="player-section">
          <h3>Player</h3>
          <p>Name: {battle.player.fighter.name}</p>
          <p>Health: {battle.player.hp}</p>
          <p>Attack: {battle.player.fighter.attack}</p>
          <p>Defense: {battle.player.fighter.defense}</p>
        </div>

        <div className="battle-actions">
          <button onClick={handleAttack}>Attack</button>

          <button onClick={handleAbility}>
            {battle.player.fighter.ability_name}
          </button>
        </div>

        <div className="opponent-section">
          <h3>Opponent</h3>
          <p>Name: {battle.opponent.fighter.name}</p>
          <p>Health: {battle.opponent.hp}</p>
          <p>Attack: {battle.opponent.fighter.attack}</p>
          <p>Defense: {battle.opponent.fighter.defense}</p>
        </div>
      </div>
      {battle.status === "player won" && <h2>You Win!</h2>}

      {battle.status === "ai won" && <h2>You Lose!</h2>}

      {battle.status !== "active" && (
        <button onClick={resetBattle}>Play Again</button>
      )}

      <div>
        <h3>Battle Messages</h3>

        <div>{messages[0]}</div>
        <div>{messages[1]}</div>
        <div>{messages[2]}</div>
        <div>{messages[3]}</div>
      </div>
    </div>
  );
}

export default Battle;

//Preserving
//  {battle.status === "player won" && <h2>You Win!</h2>}
//       {battle.status === "ai won" && <h2>You Lose!</h2>}
//       {battle.status !== "active" && (
//         <button onClick={resetBattle}>Play Again</button>
//       )}
