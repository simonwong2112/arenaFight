import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const loginUser = {
      username: username,
      password: password,
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginUser),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Login:", data);

        localStorage.setItem("token", data.token);
        onLogin(data.token);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  };

  return (
    <div>
      <h2>Login</h2>
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

        <button type="submit">Login</button>
      </form>
      <p> Don't have an account? </p>
      <button type="button" onClick={() => navigate("/register")}>
        {" "}
        Register{" "}
      </button>{" "}
    </div>
  );
}

export default Login;
