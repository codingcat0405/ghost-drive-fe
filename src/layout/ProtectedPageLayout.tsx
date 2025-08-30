import { Link, Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { ACCESS_TOKEN_KEY } from "../constants";

const ProtectedPageLayout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
      <Outlet />
      <div>footer</div>
    </div>
  );
};

export default ProtectedPageLayout;
