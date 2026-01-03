import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import "./Auth.css";

/* ✅ SSN College Email Validation */
const isValidSSNEmail = (email) => {
  return /^[a-zA-Z]+[0-9]{7}@ssn\.edu\.in$/.test(email);
};

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

    // ✅ SSN Email Validation
    if (!isValidSSNEmail(form.email.trim())) {
      setError("Only SSN college email IDs are allowed (name + 7 digit ID @ssn.edu.in)");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // 2. Update display name
      await updateProfile(userCredential.user, {
        displayName: form.name.trim()
      });

      // 3. Send verification email FIRST
      await sendEmailVerification(userCredential.user);

      // 4. Store user data in localStorage (will be saved to Firestore after verification)
      const interestsArray = form.interests
        ? form.interests.split(",").map((i) => i.trim()).filter(Boolean)
        : [];

      localStorage.setItem('pendingUserData', JSON.stringify({
        uid: userCredential.user.uid,
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        year: form.year.trim(),
        interests: interestsArray,
        role: "user"
      }));

      // 5. Sign out (user must verify first)
      await auth.signOut();

      alert("Verification email sent! Please check Inbox, Spam or Promotions folder, then login after verifying.");
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

          <input
            className="auth-input"
            name="name"
            placeholder="Full Name *"
            value={form.name}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <input
            className="auth-input"
            name="email"
            placeholder="College Email (ssn.edu.in) *"
            value={form.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Password *"
            value={form.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          <input
            className="auth-input"
            name="department"
            placeholder="Department *"
            value={form.department}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            name="year"
            placeholder="Year *"
            value={form.year}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            name="interests"
            placeholder="Interests (optional)"
            value={form.interests}
            onChange={handleChange}
          />

          <button
            className="auth-button"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p>
            Admin? <span onClick={onSwitchToAdmin} style={{ color: "#5b5fc7", cursor: "pointer", textDecoration: "underline" }}>Sign up as Admin</span>
          </p>

          <p>
            Already have an account? <span onClick={onSwitchToLogin} style={{ color: "#5b5fc7", cursor: "pointer", textDecoration: "underline" }}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupUser;