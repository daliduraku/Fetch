export default function extractCursor(cursor) {
  if (!cursor) return null;
  if (!cursor.includes("from=")) return cursor;
  const parts = cursor.split("?");
  if (parts.length < 2) return null;
  const params = new URLSearchParams(parts[1]);
  return params.get("from");
}
