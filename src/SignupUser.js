import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Auth.css";

function SignupUser({ onSwitchToLogin, onSwitchToAdmin }) {
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSignup();
    }
  };

  const handleSignup = async () => {
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.department.trim() ||
      !form.year.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
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

      // 🔥 FIX 1 — send verification email
      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        year: form.year.trim(),
        interests: form.interests
          ? form.interests.split(",").map((i) => i.trim()).filter(Boolean)
          : [],
        role: "user",
        createdAt: new Date()
      });

      // Sign out after signup
      await auth.signOut();

      alert("Verification email sent! Please verify and login.");

      // 🔥 Redirect to login
      onSwitchToLogin();

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError(err.message || "Signup failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">
          <h2 className="auth-title">Create Account 🎓</h2>

          {error && <p className="auth-error">{error}</p>}

          <input className="auth-input" name="name" placeholder="Full Name *"
            value={form.name} onChange={handleChange} onKeyPress={handleKeyPress} />

          <input className="auth-input" name="email" placeholder="Email *"
            value={form.email} onChange={handleChange} onKeyPress={handleKeyPress} />

          <input className="auth-input" name="password" type="password"
            placeholder="Password *"
            value={form.password} onChange={handleChange} onKeyPress={handleKeyPress} />

          <input className="auth-input" name="department" placeholder="Department *"
            value={form.department} onChange={handleChange} />

          <input className="auth-input" name="year" placeholder="Year *"
            value={form.year} onChange={handleChange} />

          <input className="auth-input" name="interests"
            placeholder="Interests (optional)"
            value={form.interests} onChange={handleChange} />

          <button className="auth-button" onClick={handleSignup} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p>
            Admin? <span onClick={onSwitchToAdmin}>Sign up as Admin</span>
          </p>

          <p>
            Already have an account? <span onClick={onSwitchToLogin}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupUser;
