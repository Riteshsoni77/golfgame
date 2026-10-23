import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";
import server from "../../environment";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const isRegister = location.pathname === "/register";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("subscriber");
  const [isSubmitting, setIsSubmitting] = useState(false);

  
async function handleSubmit(event) {
  event.preventDefault();
  setIsSubmitting(true);

  try {
    const url = isRegister
      ? `${server}/api/user/register`
      : `${server}/api/user/login`;

    const requestData = isRegister
      ? {
          name,
          username: username.trim().toLowerCase(),
          password,
        }
      : {
          username: username.trim().toLowerCase(),
          password,
          role,
        };

    const response = await axios.post(url, requestData);

    if (isRegister) {
      alert("Registration successful!");
      navigate("/login");
      return;
    }

    // Save login details
    const token = response.data.token;
    const user = response.data.user;

    localStorage.setItem("golfToken", token);
    localStorage.setItem("golfUser", JSON.stringify(user));

    // Administrator goes directly to dashboard
   if (user.role === "administrator") {
  navigate("/admin");
  return;
}

    // Fetch subscription
    try {
      const subscriptionResponse = await axios.get(
        `${server}/api/subscription`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const subscription = subscriptionResponse.data.subscription;

      const isActive =
        subscription?.status === "active" &&
        subscription?.renewalDate &&
        new Date(subscription.renewalDate) > new Date();

      if (isActive) {
        navigate("/dashboard");
      } else {
        navigate("/subscription");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        navigate("/subscription");
      } else {
        throw error;
      }
    }
  } catch (error) {
    alert(
      error.response?.data?.message ||
        error.message ||
        "Request failed"
    );
  } finally {
    setIsSubmitting(false);
  }
}


  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>{isRegister ? "Register" : "Login"}</h1>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {!isRegister && (
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="subscriber">Subscriber</option>
              <option value="administrator">Administrator</option>
            </select>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : isRegister
                ? "Register"
                : "Login"}
          </button>
        </form>

        <p>
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            className="link-button"
            type="button"
            onClick={() => navigate(isRegister ? "/login" : "/register")}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;