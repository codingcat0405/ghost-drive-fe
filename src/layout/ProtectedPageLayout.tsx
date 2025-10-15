import { Outlet, useLocation, useNavigate } from "react-router";
import "./globals.css";
import { useEffect } from "react";
import { ACCESS_TOKEN_KEY } from "@/constants";

const ProtectedPageLayout = () => {
  const navigate = useNavigate();
  const pathname = useLocation();
  console.log(pathname);

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) {
      navigate("/login");
    }
  }, [pathname.pathname]);
  return <Outlet />;
};

export default ProtectedPageLayout;
