import FighterCard from "./FighterCard";

function FighterList({ fighters, onFighterChanged }) {
  return (
    <div>
      {fighters.map((fighter) => (
        <FighterCard
          key={fighter.id}
          fighter={fighter}
          onFighterChanged={onFighterChanged}
        />
      ))}
    </div>
  );
}
export default FighterList;
