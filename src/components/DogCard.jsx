import React from "react";

// src/components/DogCard.jsx
export default function DogCard({ dog, isFavorite, onToggleFavorite }) {
  return (
    <div className="dog-card">
      <h3>{dog.name}</h3>
      <img
        src={dog.img}
        alt={`This is a ${dog.bread} and their name is ${dog.name}`}
        className="card-image"
      ></img>
      <div className="dog-info">
        <div>
          <strong>Breed:</strong> {dog.breed}
        </div>
        <div>
          <strong>Age:</strong> {dog.age}
        </div>
        <div>
          <strong>Zip Code:</strong> {dog.zip_code || "Unknown"}
        </div>
      </div>
      <button
        className={`favorite-btn${isFavorite ? " favorited" : ""}`}
        onClick={() => onToggleFavorite(dog.id)}
      >
        {isFavorite ? "★ Favorited" : "☆ Favorite"}
      </button>
    </div>
  );
}
