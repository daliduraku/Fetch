import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const LOGIN_URL = `${API_BASE}/auth/login`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        let message = `Login failed (status ${res.status})`;
        try {
          const errorJson = await res.json();
          if (errorJson && errorJson.message) {
            message = errorJson.message;
          }
        } catch {
          //
        }
        throw new Error(message);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-outer">
      <h1 className="login-title">
        <span className="paw-icon" role="img" aria-label="paw">
          🐾
        </span>
        Fetch Dog Matcher
      </h1>
      <p className="login-info">
        The first three days should be focused on decompression, the next three
        weeks on settling in and basic training, and the following three months
        on continued socialization and bonding.
      </p>
      <div className="login-card">
        <h2 className="login-heading">Log In</h2>

        {error && <div className="login-errorBox">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </label>

          <label className="login-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="johndoe@example.com"
              disabled={loading}
              required
            />
          </label>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
