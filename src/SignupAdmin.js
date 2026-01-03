import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import "./Auth.css";

const ADMIN_SECRET = "admin@123";

/* ✅ SSN College Email Validation */
const isValidSSNEmail = (email) => {
  return /^[a-zA-Z]+[0-9]{7}@ssn\.edu\.in$/.test(email);
};

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

    // Validate all fields
    if (!form.name.trim() || !form.email.trim() || !form.password || 
        !form.department.trim() || !form.year.trim() || !form.adminKey) {
      setError("Please fill all fields.");
      return;
    }

    // Validate admin key
    if (form.adminKey !== ADMIN_SECRET) {
      setError("Invalid Admin Key.");
      return;
    }

    // ✅ SSN Email Validation
    if (!isValidSSNEmail(form.email.trim())) {
      setError("Only SSN college email IDs are allowed (name + 7 digit ID @ssn.edu.in)");
      return;
    }

    // Validate password
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // 2. Update display name
      await updateProfile(userCredential.user, {
        displayName: form.name.trim()
      });

      // 3. Send verification email FIRST (before Firestore write)
      await sendEmailVerification(userCredential.user);

      // 4. Store admin data in localStorage (will be saved to Firestore after verification)
      localStorage.setItem('pendingAdminData', JSON.stringify({
        uid: userCredential.user.uid,
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        year: form.year.trim(),
        role: "admin"
      }));

      // 5. Sign out (user must verify first)
      await auth.signOut();

      alert("Admin account created! Verification email sent. Please check Inbox, Spam or Promotions folder, then login after verifying.");
      onSwitchToLogin();

    } catch (err) {
      console.error("Admin signup error:", err);
      
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError(err.message || "Admin signup failed.");
      }
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

          <input 
            className="auth-input" 
            name="name" 
            placeholder="Full Name *" 
            value={form.name}
            onChange={handleChange} 
          />

          <input 
            className="auth-input" 
            name="email" 
            placeholder="College Email (ssn.edu.in) *" 
            value={form.email}
            onChange={handleChange} 
          />

          <input 
            className="auth-input" 
            type="password" 
            name="password" 
            placeholder="Password (min 6 chars) *" 
            value={form.password}
            onChange={handleChange} 
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
            type="password"
            name="adminKey" 
            placeholder="Admin Secret Key *" 
            value={form.adminKey}
            onChange={handleChange} 
          />

          <button 
            className="auth-button" 
            onClick={handleSignup} 
            disabled={loading}
          >
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