import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import Signup from "./Signup";
import Login from "./Log";

function App() {
  const { user } = useContext(AuthContext);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <>
          <h2>Welcome {user.name}</h2>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Signup />
          <Login />
        </>
      )}
    </div>
  );
}

export default App;


