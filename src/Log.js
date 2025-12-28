import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Auth.css";

function Log({ onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setError("");

    // Basic validation
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      // SUCCESS:
      // AuthContext will automatically handle role & redirect
    } catch (err) {
      // Provide user-friendly error messages
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else if (err.code === 'auth/user-disabled') {
        setError("This account has been disabled. Contact support.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please check and try again.");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">

          <h2 className="auth-title">Welcome Back 👋</h2>
          <p className="auth-subtitle">
            Login to continue to Campus Events
          </p>

          {error && <p className="auth-error">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(""); // Clear error on input
            }}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoComplete="email"
            required
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="auth-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(""); // Clear error on input
              }}
              onKeyPress={handleKeyPress}
              disabled={loading}
              autoComplete="current-password"
              required
              style={{ paddingRight: '50px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px',
                color: '#666'
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button
            className="auth-button"
            onClick={handleLogin}
            disabled={loading}
            aria-label="Login"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="auth-footer">
            Don't have an account?{" "}
            <span
              onClick={!loading ? onSwitchToSignup : undefined}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) onSwitchToSignup();
              }}
            >
              Sign up
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Log;