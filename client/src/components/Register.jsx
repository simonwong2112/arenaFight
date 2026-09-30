import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const newUser = {
      username: username,
      password: password,
    };

   fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Registration:", data);
      })
      .catch((error) => {
        console.error("Error registering user:", error);
      });
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit">Register</button>
      </form>
      <p> Already have an account? </p>{" "}
      <button type="button" onClick={() => navigate("/login")}>
        {" "}
        Back to Login{" "}
      </button>
    </div>
  );
}

export default Register;
