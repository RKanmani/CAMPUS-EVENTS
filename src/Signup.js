import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Auth.css";

function Signup({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
    interests: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSignup = async () => {
    setError("");

    if (!form.name || !form.email || !form.password || !form.department || !form.year) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        year: form.year.trim(),
        interests: form.interests
          ? form.interests.split(",").map(i => i.trim())
          : [],
        role: "user",
        createdAt: new Date()
      });

    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">

          <h2 className="auth-title">Create Account 🎓</h2>
          <p className="auth-subtitle">Join and explore campus events</p>

          {error && <p className="auth-error">{error}</p>}

          <input className="auth-input" name="name" placeholder="Full Name" onChange={handleChange} />
          <input className="auth-input" name="email" type="email" placeholder="Email" onChange={handleChange} />
          <input className="auth-input" name="password" type="password" placeholder="Password" onChange={handleChange} />
          <input className="auth-input" name="department" placeholder="Department" onChange={handleChange} />
          <input className="auth-input" name="year" placeholder="Year" onChange={handleChange} />
          <input className="auth-input" name="interests" placeholder="Interests (comma separated)" onChange={handleChange} />

          <button className="auth-button" onClick={handleSignup} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="auth-footer">
            Already have an account? <span onClick={onSwitchToLogin}>Login</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;
