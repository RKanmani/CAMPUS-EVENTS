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
      setError(err.message || "Admin signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay">
        <div className="auth-card">

          <h2 className="auth-title">Admin Signup 🔐</h2>
          <p className="auth-subtitle">Authorized admins only</p>

          {error && <p className="auth-error">{error}</p>}

          <input className="auth-input" name="name" placeholder="Name" onChange={handleChange} />
          <input className="auth-input" name="email" placeholder="Email" onChange={handleChange} />
          <input className="auth-input" type="password" name="password" placeholder="Password" onChange={handleChange} />
          <input className="auth-input" name="department" placeholder="Department" onChange={handleChange} />
          <input className="auth-input" name="year" placeholder="Year" onChange={handleChange} />
          <input className="auth-input" name="adminKey" placeholder="Admin Key" onChange={handleChange} />

          <button className="auth-button" onClick={handleSignup} disabled={loading}>
            {loading ? "Creating Admin..." : "Create Admin"}
          </button>

          <div className="auth-footer">
            Student? <span onClick={onSwitchToUser}>Sign up as User</span>
          </div>

          <div className="auth-footer">
            Already registered? <span onClick={onSwitchToLogin}>Login</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignupAdmin;
