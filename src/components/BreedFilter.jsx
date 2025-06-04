import React from "react";

export default function BreedFilter({ breeds, selectedBreed, onChangeBreed }) {
  return (
    <div className="breed-filter">
      <label>
        <select
          value={selectedBreed}
          onChange={(e) => onChangeBreed(e.target.value)}
        >
          <option value="">- All Breeds -</option>
          {breeds.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
