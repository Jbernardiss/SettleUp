import React from "react";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Login</h1>
      <button onClick={() => navigate("/home")}>Go to Home</button>
      {/* Add your stories content here */}
    </div>
  );
};
