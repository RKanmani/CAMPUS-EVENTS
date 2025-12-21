import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Auth.css";

function Log({ onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">

          <h2 className="auth-title">Welcome Back 👋</h2>
          <p className="auth-subtitle">
            Login to continue to Campus Events
          </p>

          {error && (
            <p style={{ color: "red", textAlign: "center", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="auth-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Login"}
          </button>

          <div className="auth-footer">
            Don't have an account?{" "}
            <span onClick={onSwitchToSignup}>
              Sign up
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Log;
