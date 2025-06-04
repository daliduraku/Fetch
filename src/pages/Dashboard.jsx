import React, { useState, useEffect, useCallback } from "react";
import DogCard from "../components/DogCard";
import BreedFilter from "../components/BreedFilter";
import Pagination from "../components/Pagination";
import extractCursor from "../utils/extractCursor.js";

export default function Dashboard() {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [cursor, setCursor] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [prevCursor, setPrevCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingDogs, setLoadingDogs] = useState(false);
  const [errorDogs, setErrorDogs] = useState(null);

  const [favorites, setFavorites] = useState(new Set());
  const [matchId, setMatchId] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matchedDog, setMatchedDog] = useState(null);

  const PAGE_SIZE = 25;
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE}/dogs/breeds`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch breeds (status ${res.status})`);
        return res.json();
      })
      .then((data) => setBreeds(data.sort()))
      .catch((err) => {
        setErrorDogs("Error loading breeds: " + err.message);
      });
  }, []);

  const toggleFavorite = (dogId) => {
    setFavorites((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(dogId)) newSet.delete(dogId);
      else newSet.add(dogId);
      return newSet;
    });
  };

  const favoriteIdsArray = Array.from(favorites).map(String);

  const fetchPageOfDogs = useCallback(() => {
    setLoadingDogs(true);
    setErrorDogs(null);

    const params = new URLSearchParams();
    params.set("size", PAGE_SIZE);
    if (cursor) params.set("from", cursor);
    params.set("sort", `breed:${sortOrder}`);
    if (selectedBreed) params.append("breeds", selectedBreed);

    fetch(`${API_BASE}/dogs/search?${params.toString()}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed (status ${res.status})`);
        return res.json();
      })
      .then(async (data) => {
        const { resultIds, next, prev } = data;
        setNextCursor(extractCursor(next));
        setPrevCursor(extractCursor(prev));

        if (!resultIds || resultIds.length === 0) {
          setDogs([]);
          setLoadingDogs(false);
          return;
        }

        const resp2 = await fetch(`${API_BASE}/dogs`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultIds),
        });
        if (!resp2.ok) {
          throw new Error(
            `Failed to fetch dog details (status ${resp2.status})`
          );
        }
        const fullDogs = await resp2.json();
        setDogs(fullDogs);
      })
      .catch((err) => {
        setErrorDogs(err.message);
      })
      .finally(() => {
        setLoadingDogs(false);
      });
  }, [cursor, selectedBreed, sortOrder]);

  useEffect(() => {
    fetchPageOfDogs();
  }, [fetchPageOfDogs]);

  const handleGenerateMatch = async () => {
    if (favoriteIdsArray.length === 0) {
      alert("Please favorite at least one dog before generating a match.");
      return;
    }
    setMatching(true);
    setMatchId(null);
    setMatchedDog(null);

    try {
      const res = await fetch(`${API_BASE}/dogs/match`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(favoriteIdsArray),
      });
      if (!res.ok) throw new Error(`Match failed (status ${res.status})`);
      const { match } = await res.json();
      setMatchId(match);

      const dogRes = await fetch(`${API_BASE}/dogs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([match]),
      });
      if (!dogRes.ok) throw new Error("Failed to fetch matched dog details.");
      const dogsArr = await dogRes.json();
      setMatchedDog(dogsArr[0]);
    } catch (err) {
      alert(`Error generating match: ${err.message}`);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="dashboard-outer">
      <h1 className="dashboard-heading">Browse Dogs for Adoption</h1>

      <BreedFilter
        breeds={breeds}
        selectedBreed={selectedBreed}
        onChangeBreed={(b) => {
          setSelectedBreed(b);
          setCursor(null);
        }}
      />

      <div className="sort-controls">
        <button
          className={`sort-button ${sortOrder === "asc" ? "active" : ""}`}
          onClick={() => {
            setSortOrder("asc");
            setCursor(null);
          }}
        >
          A → Z
        </button>
        <button
          className={`sort-button ${sortOrder === "desc" ? "active" : ""}`}
          onClick={() => {
            setSortOrder("desc");
            setCursor(null);
          }}
        >
          Z → A
        </button>
      </div>

      {loadingDogs ? (
        <p>Loading dogs…</p>
      ) : errorDogs ? (
        <p style={{ color: "red" }}>{errorDogs}</p>
      ) : dogs.length === 0 ? (
        <p>No dogs found.</p>
      ) : (
        <div className="dogs-grid">
          {dogs.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              isFavorite={favorites.has(dog.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <Pagination
        prevCursor={prevCursor}
        nextCursor={nextCursor}
        onCursorChange={(newCursor) => setCursor(newCursor)}
      />

      <div className="match-section">
        <button
          onClick={handleGenerateMatch}
          disabled={matching || favoriteIdsArray.length === 0}
          className="generate-match-button"
        >
          {matching
            ? "Generating match…"
            : `Generate Match (${favoriteIdsArray.length} favorited)`}
        </button>

        {matchedDog ? (
          <div className="match-result">
            <h2>Your Matched Dog:</h2>
            <div
              className="dog-card"
              style={{ margin: "0 auto", maxWidth: "340px" }}
            >
              <h3>{matchedDog.name}</h3>
              <div className="dog-info">
                <img
                  src={matchedDog.img}
                  alt={`This is a ${matchedDog.bread} and their name is ${matchedDog.name}`}
                  className="card-image"
                ></img>
                <div>
                  <strong>Breed:</strong> {matchedDog.breed}
                </div>
                <div>
                  <strong>Age:</strong> {matchedDog.age}
                </div>
                <div>
                  <strong>Zip Code:</strong> {matchedDog.zip_code || "Unknown"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          matchId && (
            <div className="match-result">
              <h2>Your Match Object ID:</h2>
              <div className="match-id">{matchId}</div>
              <p>
                (You can now POST this ID to <code>/dogs</code> if you need full
                dog details.)
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
