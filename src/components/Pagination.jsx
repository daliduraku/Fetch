import React from "react";

export default function Pagination({ prevCursor, nextCursor, onCursorChange }) {
  return (
    <div className="pagination-container">
      <button
        onClick={() => onCursorChange(prevCursor)}
        disabled={!prevCursor}
        className="pagination-button"
      >
        ← Prev
      </button>
      <button
        onClick={() => onCursorChange(nextCursor)}
        disabled={!nextCursor}
        className="pagination-button"
      >
        Next →
      </button>
    </div>
  );
}
