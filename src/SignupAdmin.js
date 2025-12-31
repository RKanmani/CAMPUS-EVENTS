import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Auth.css";

const ADMIN_SECRET = "admin@123";

function SignupAdmin({ onSwitchToLogin, onSwitchToUser }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
    adminKey: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSignup = async () => {
    setError("");

    if (form.adminKey !== ADMIN_SECRET) {
      setError("Invalid Admin Key.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // 🔥 FIX 1 — email verification
      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        year: form.year.trim(),
        role: "admin",
        createdAt: new Date()
      });

      await auth.signOut();

      alert("Admin verification email sent. Please verify and login.");
      onSwitchToLogin();

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
          <h2>Admin Signup 🔐</h2>

          {error && <p className="auth-error">{error}</p>}

          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <input name="department" placeholder="Department" onChange={handleChange} />
          <input name="year" placeholder="Year" onChange={handleChange} />
          <input name="adminKey" placeholder="Admin Key" onChange={handleChange} />

          <button onClick={handleSignup} disabled={loading}>
            {loading ? "Creating..." : "Create Admin"}
          </button>

          <p>
            Student? <span onClick={onSwitchToUser}>Sign up as User</span>
          </p>
          <p>
            Login? <span onClick={onSwitchToLogin}>Go to Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupAdmin;
