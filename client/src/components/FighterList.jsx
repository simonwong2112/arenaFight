import FighterCard from "./FighterCard";

function FighterList({ fighters, onFightersChanged, token }) {
  return (
    <div>
      {fighters.map((fighter) => (
        <FighterCard
          key={fighter.id}
          fighter={fighter}
          onFighterChanged={onFightersChanged}
          token={token}
        />
      ))}
    </div>
  );
}
export default FighterList;
