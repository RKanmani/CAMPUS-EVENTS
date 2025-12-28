import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
  const [showAdminKey, setShowAdminKey] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
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
      !form.year.trim() ||
      !form.adminKey
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

    if (form.adminKey !== ADMIN_SECRET) {
      setError("Invalid Admin Key. Access denied.");
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
        role: "admin",
        createdAt: new Date()
      });

      // Sign out immediately after creating account
      await auth.signOut();
      
      // Show success message
      alert("Admin account created successfully! Please login to continue.");
      
      // Redirect to login
      onSwitchToLogin();

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
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
          <p className="auth-subtitle">Restricted access - Admin key required</p>

          {error && <p className="auth-error">{error}</p>}

          <input
            className="auth-input"
            name="name"
            type="text"
            placeholder="Full Name *"
            value={form.name}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoComplete="name"
            required
          />

          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoComplete="email"
            required
          />

          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Password (min 6 characters) *"
            value={form.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoComplete="new-password"
            required
          />

          <input
            className="auth-input"
            name="department"
            type="text"
            placeholder="Department *"
            value={form.department}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            required
          />

          <input
            className="auth-input"
            name="year"
            type="text"
            placeholder="Year (e.g., 2024) *"
            value={form.year}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            required
          />

          <div style={{ position: 'relative' }}>
            <input
              className="auth-input"
              name="adminKey"
              type={showAdminKey ? "text" : "password"}
              placeholder="Admin Key *"
              value={form.adminKey}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              autoComplete="off"
              required
              style={{ paddingRight: '50px' }}
            />
            <button
              type="button"
              onClick={() => setShowAdminKey(!showAdminKey)}
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
              aria-label={showAdminKey ? "Hide admin key" : "Show admin key"}
            >
              {showAdminKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button
            className="auth-button"
            onClick={handleSignup}
            disabled={loading}
            aria-label="Create Admin Account"
          >
            {loading ? "Creating Admin..." : "Create Admin"}
          </button>

          {onSwitchToUser && (
            <p style={{ 
              textAlign: 'center', 
              marginTop: '16px', 
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Not an admin?{" "}
              <span
                onClick={!loading ? onSwitchToUser : undefined}
                style={{
                  color: '#5b5fc7',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                role="button"
                tabIndex={0}
              >
                Sign up as Student
              </span>
            </p>
          )}

          <div className="auth-footer">
            Already have an account?{" "}
            <span
              onClick={!loading ? onSwitchToLogin : undefined}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) onSwitchToLogin();
              }}
            >
              Login
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignupAdmin;