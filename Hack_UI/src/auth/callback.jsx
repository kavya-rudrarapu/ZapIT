import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const userId = params.get("user_id");

    if (token && name && email && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("user_id", userId);

      navigate("/tickets");
    } else {
      console.error("Missing required auth parameters in callback URL");
      navigate("/login");
    }
  }, [navigate, location]);

  return <div>Signing you in...</div>;
};

export default AuthCallback;
