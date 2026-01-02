import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from "firebase/auth";
import "./Auth.css";

// SSN email validation
const isValidSSNEmail = (email) => {
  return /^[a-zA-Z]+[0-9]{7}@ssn\.edu\.in$/.test(email);
};

function Log({ onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setInfo("");
    setShowResend(false);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isValidSSNEmail(email.trim())) {
      setError("Only SSN college email IDs are allowed.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      // Force refresh verification status
      await auth.currentUser.getIdToken(true);

      if (!user.emailVerified) {
        setShowResend(true);
        await signOut(auth);
        setError("Email not verified.");
        setInfo(
          "Please check Inbox, Spam or Promotions folder."
        );
        return;
      }

      // Extra safety check
      if (!user.email.endsWith("@ssn.edu.in")) {
        await signOut(auth);
        setError("Access restricted to SSN students only.");
        return;
      }

      // ✅ Success
      navigate("/");

    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await sendEmailVerification(userCredential.user);
      await signOut(auth);

      setInfo(
        "Verification email resent. Please check Inbox or Spam folder."
      );
      setShowResend(false);
    } catch {
      setError("Unable to resend verification email.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">

          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to continue</p>

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <input
            className="auth-input"
            type="email"
            placeholder="College Email (ssn.edu.in)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            className="auth-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* 🔁 RESEND BUTTON */}
          {showResend && (
            <button
              className="auth-button secondary"
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </button>
          )}

          <div className="auth-footer">
            Don’t have an account?{" "}
            <span onClick={onSwitchToSignup}>Sign up</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Log;
