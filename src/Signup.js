import { useState } from "react";
import { auth, db } from "./firebase"; // connect firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Signup() {
  // store form inputs
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
    interests: ""
  });

  // update form state on typing
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // signup function
  const signup = async () => {
    try {
      // create user in Firebase Auth
      const user = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // save profile in Firestore
      await setDoc(doc(db, "users", user.user.uid), {
        name: form.name,
        email: form.email,
        department: form.department,
        year: form.year,
        interests: form.interests.split(",")
      });

      alert("Signup Successful!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input name="name" placeholder="Name" onChange={handleChange} /><br/>
      <input name="email" placeholder="Email" onChange={handleChange} /><br/>
      <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br/>
      <input name="department" placeholder="Department" onChange={handleChange} /><br/>
      <input name="year" placeholder="Year" onChange={handleChange} /><br/>
      <input name="interests" placeholder="Interests (comma separated)" onChange={handleChange} /><br/>
      <button onClick={signup}>Sign Up</button>
    </div>
  );
}

export default Signup;
