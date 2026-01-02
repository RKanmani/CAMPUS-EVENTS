import { useState, useContext } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

import "./Auth.css";

function CompleteProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSaveProfile = async () => {
    setError("");

    if (!department || !year || !interests.trim()) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      await updateDoc(userRef, {
        department,
        year,
        interests: interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        });

        // 🔄 Force AuthContext to re-evaluate
        window.location.href = "/";

    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">

          <h2 className="auth-title">Complete Your Profile</h2>
          <p className="auth-subtitle">
            Required to personalize events & Gemini suggestions
          </p>

          {error && <p className="auth-error">{error}</p>}

          <input
            className="auth-input"
            placeholder="Department (e.g. CSE, ECE)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <input
            className="auth-input"
            placeholder="Year (1 / 2 / 3 / 4)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <input
            className="auth-input"
            placeholder="Interests (comma separated)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />

          <button
            className="auth-button"
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;
