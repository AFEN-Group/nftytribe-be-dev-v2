import React, { useState } from "react";
import "./style.css";

const AdminLogin = ({ handleSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="admin-login">
      <h2 className="admin-login-title">Admin Dashboard Login</h2>
      <form
        onSubmit={(event) => handleSubmit(event, email, password)}
        className="admin-login-form">
        <div className="admin-login-input-group">
          <label htmlFor="email" className="admin-login-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="admin-login-input"
          />
        </div>
        <div className="admin-login-input-group">
          <label htmlFor="password" className="admin-login-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="admin-login-input"
          />
        </div>
        <div className="admin-login-submit-container">
          <button type="submit" className="admin-login-submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
